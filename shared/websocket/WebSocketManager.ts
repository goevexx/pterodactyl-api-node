import WebSocket from 'ws';
import {
	WebSocketManagerConfig,
	WebSocketEvent,
	WebSocketCommand,
	WebSocketTokenResponse,
	EventHandler,
	ReconnectionState,
} from './WebSocketTypes';

/**
 * Pterodactyl WebSocket connection manager
 * Handles authentication, reconnection, token refresh, and event management
 */
export class PterodactylWebSocketManager {
	private config: WebSocketManagerConfig;
	private socket: WebSocket | null = null;
	private token: string | null = null;
	private socketUrl: string | null = null;
	private reconnectionState: ReconnectionState = {
		attempt: 0,
		delay: 1000,
		inProgress: false,
	};
	private eventHandlers: Map<string, EventHandler[]> = new Map();
	private reconnectTimer: NodeJS.Timeout | null = null;
	private tokenRefreshTimer: NodeJS.Timeout | null = null;
	private heartbeatTimer: NodeJS.Timeout | null = null;
	private tokenFetchFn: () => Promise<WebSocketTokenResponse>;
	private isManuallyDisconnected: boolean = false;

	/**
	 * Create a new WebSocket manager
	 * @param config - Configuration options
	 * @param tokenFetchFn - Function to fetch WebSocket token from API
	 */
	constructor(
		config: WebSocketManagerConfig,
		tokenFetchFn: () => Promise<WebSocketTokenResponse>,
	) {
		this.config = {
			autoReconnect: true,
			maxReconnectAttempts: 5,
			enableHeartbeat: true,
			heartbeatInterval: 30000,
			...config,
		};
		this.tokenFetchFn = tokenFetchFn;
	}

	/**
	 * Connect to the WebSocket server
	 */
	async connect(): Promise<void> {
		try {
			// Fetch WebSocket token
			const tokenData = await this.tokenFetchFn();
			this.token = tokenData.token;
			this.socketUrl = tokenData.socket;

			// Decode JWT to get expiration time
			const tokenParts = this.token.split('.');
			if (tokenParts.length === 3) {
				try {
					const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
					if (payload.exp) {
						// Schedule token refresh 30 seconds before expiration
						const expiresIn = payload.exp * 1000 - Date.now() - 30000;
						if (expiresIn > 0) {
							this.scheduleTokenRefresh(expiresIn);
						}
					}
				} catch (e) {
					console.warn('[WebSocketManager] Failed to decode JWT token:', e);
				}
			}

			// Create WebSocket connection
			this.socket = new WebSocket(this.socketUrl, {
				headers: {
					Origin: this.config.panelUrl,
				},
			});

			this.setupEventHandlers();

			// Wait for connection to open
			await new Promise<void>((resolve, reject) => {
				if (!this.socket) {
					reject(new Error('Socket is null'));
					return;
				}

				const timeout = setTimeout(() => {
					reject(new Error('WebSocket connection timeout'));
				}, 30000);

				this.socket.once('open', () => {
					clearTimeout(timeout);
					resolve();
				});

				this.socket.once('error', (error) => {
					clearTimeout(timeout);
					reject(error);
				});
			});

			// Send authentication
			this.sendCommand({ event: 'auth', args: [this.token] });

			// Reset reconnection state on successful connection
			this.reconnectionState = {
				attempt: 0,
				delay: 1000,
				inProgress: false,
			};

			// Start heartbeat if enabled
			if (this.config.enableHeartbeat) {
				this.startHeartbeat();
			}

			console.log('[WebSocketManager] Connected successfully');
		} catch (error: any) {
			console.error('[WebSocketManager] Connection failed:', error.message);
			throw error;
		}
	}

	/**
	 * Set up WebSocket event handlers
	 */
	private setupEventHandlers(): void {
		if (!this.socket) return;

		this.socket.on('message', (data: WebSocket.Data) => {
			try {
				const message = JSON.parse(data.toString());
				this.handleMessage(message);
			} catch (error) {
				console.error('[WebSocketManager] Failed to parse message:', error);
			}
		});

		this.socket.on('close', (code: number, reason: Buffer) => {
			console.log(`[WebSocketManager] Connection closed: ${code} ${reason.toString()}`);
			this.handleClose(code, reason.toString());
		});

		this.socket.on('error', (error: Error) => {
			console.error('[WebSocketManager] Socket error:', error);
			this.emit('error', error);
		});

		this.socket.on('ping', () => {
			this.socket?.pong();
		});
	}

	/**
	 * Handle incoming WebSocket message
	 */
	private handleMessage(message: WebSocketEvent): void {
		// Emit to event handlers
		this.emit(message.event, message.args);

		// Handle special events
		switch (message.event) {
			case 'token expiring':
				console.log('[WebSocketManager] Token expiring, refreshing...');
				this.refreshToken().catch((error) => {
					console.error('[WebSocketManager] Token refresh failed:', error);
				});
				break;
			case 'token expired':
				console.log('[WebSocketManager] Token expired');
				this.handleTokenExpired();
				break;
			case 'jwt error':
				console.error('[WebSocketManager] JWT error:', message.args);
				this.emit('auth_error', message.args);
				break;
		}
	}

	/**
	 * Handle WebSocket close event
	 */
	private handleClose(_code: number, reason: string): void {
		this.stopHeartbeat();
		this.clearTokenRefreshTimer();

		// Don't reconnect if manually disconnected
		if (this.isManuallyDisconnected) {
			return;
		}

		// Attempt reconnection if enabled
		if (this.config.autoReconnect && !this.reconnectionState.inProgress) {
			this.scheduleReconnect(_code, reason);
		}

		this.emit('disconnected', { code: _code, reason });
	}

	/**
	 * Handle token expiration
	 */
	private async handleTokenExpired(): Promise<void> {
		try {
			await this.refreshToken();
		} catch (error) {
			console.error('[WebSocketManager] Failed to refresh expired token:', error);
			// Close and attempt reconnection
			this.close();
			if (this.config.autoReconnect) {
				this.scheduleReconnect(1000, 'Token expired');
			}
		}
	}

	/**
	 * Schedule token refresh
	 */
	private scheduleTokenRefresh(delay: number): void {
		this.clearTokenRefreshTimer();

		this.tokenRefreshTimer = setTimeout(() => {
			this.refreshToken().catch((error) => {
				console.error('[WebSocketManager] Scheduled token refresh failed:', error);
			});
		}, delay);
	}

	/**
	 * Refresh authentication token
	 */
	private async refreshToken(): Promise<void> {
		try {
			const tokenData = await this.tokenFetchFn();
			this.token = tokenData.token;

			// Send new auth command
			this.sendCommand({ event: 'auth', args: [this.token] });

			// Schedule next refresh
			const tokenParts = this.token.split('.');
			if (tokenParts.length === 3) {
				try {
					const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
					if (payload.exp) {
						const expiresIn = payload.exp * 1000 - Date.now() - 30000;
						if (expiresIn > 0) {
							this.scheduleTokenRefresh(expiresIn);
						}
					}
				} catch (e) {
					console.warn('[WebSocketManager] Failed to decode refreshed JWT:', e);
				}
			}

			console.log('[WebSocketManager] Token refreshed successfully');
		} catch (error) {
			console.error('[WebSocketManager] Token refresh failed:', error);
			throw error;
		}
	}

	/**
	 * Schedule reconnection attempt
	 */
	private scheduleReconnect(_code: number, reason: string): void {
		if (
			this.config.maxReconnectAttempts &&
			this.reconnectionState.attempt >= this.config.maxReconnectAttempts
		) {
			console.error(
				`[WebSocketManager] Max reconnection attempts (${this.config.maxReconnectAttempts}) reached`,
			);
			this.emit('reconnect_failed', {
				attempts: this.reconnectionState.attempt,
				lastError: reason,
			});
			return;
		}

		this.reconnectionState.inProgress = true;
		this.reconnectionState.attempt++;

		// Calculate exponential backoff delay: 1s, 2s, 4s, 8s, 16s
		const delay = Math.min(this.reconnectionState.delay * Math.pow(2, this.reconnectionState.attempt - 1), 16000);

		console.log(
			`[WebSocketManager] Scheduling reconnection attempt ${this.reconnectionState.attempt} in ${delay}ms`,
		);

		this.reconnectTimer = setTimeout(() => {
			this.reconnectTimer = null;
			this.reconnectionState.inProgress = false;

			console.log(`[WebSocketManager] Reconnection attempt ${this.reconnectionState.attempt}`);
			this.connect()
				.then(() => {
					this.emit('reconnected', { attempts: this.reconnectionState.attempt });
				})
				.catch((error) => {
					console.error('[WebSocketManager] Reconnection failed:', error);
					// Check if max attempts reached
					if (
						this.config.maxReconnectAttempts &&
						this.reconnectionState.attempt >= this.config.maxReconnectAttempts
					) {
						console.error(
							`[WebSocketManager] Max reconnection attempts (${this.config.maxReconnectAttempts}) reached`,
						);
						this.emit('reconnect_failed', {
							attempts: this.reconnectionState.attempt,
							lastError: error.message,
						});
					} else {
						// Schedule another reconnection attempt
						this.scheduleReconnect(1000, error.message);
					}
				});
		}, delay);
	}

	/**
	 * Start heartbeat/ping mechanism
	 */
	private startHeartbeat(): void {
		this.stopHeartbeat();

		if (!this.config.heartbeatInterval) return;

		this.heartbeatTimer = setInterval(() => {
			if (this.socket && this.socket.readyState === WebSocket.OPEN) {
				this.socket.ping();
			}
		}, this.config.heartbeatInterval);
	}

	/**
	 * Stop heartbeat
	 */
	private stopHeartbeat(): void {
		if (this.heartbeatTimer) {
			clearInterval(this.heartbeatTimer);
			this.heartbeatTimer = null;
		}
	}

	/**
	 * Clear token refresh timer
	 */
	private clearTokenRefreshTimer(): void {
		if (this.tokenRefreshTimer) {
			clearTimeout(this.tokenRefreshTimer);
			this.tokenRefreshTimer = null;
		}
	}

	/**
	 * Send a command to the WebSocket server
	 */
	sendCommand(command: WebSocketCommand): void {
		if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
			console.warn('[WebSocketManager] Cannot send command: socket not connected');
			return;
		}

		try {
			this.socket.send(JSON.stringify(command));
		} catch (error) {
			console.error('[WebSocketManager] Failed to send command:', error);
			throw error;
		}
	}

	/**
	 * Register event handler
	 */
	on(event: string, handler: EventHandler): void {
		if (!this.eventHandlers.has(event)) {
			this.eventHandlers.set(event, []);
		}
		this.eventHandlers.get(event)!.push(handler);
	}

	/**
	 * Remove event handler
	 */
	off(event: string, handler: EventHandler): void {
		const handlers = this.eventHandlers.get(event);
		if (handlers) {
			const index = handlers.indexOf(handler);
			if (index !== -1) {
				handlers.splice(index, 1);
			}
		}
	}

	/**
	 * Emit event to all registered handlers
	 */
	private emit(event: string, data: any): void {
		const handlers = this.eventHandlers.get(event);
		if (handlers) {
			handlers.forEach((handler) => {
				try {
					handler(data);
				} catch (error) {
					console.error(`[WebSocketManager] Error in event handler for '${event}':`, error);
				}
			});
		}
	}

	/**
	 * Close the WebSocket connection
	 */
	close(): void {
		this.isManuallyDisconnected = true;

		// Clear all timers
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}
		this.stopHeartbeat();
		this.clearTokenRefreshTimer();

		// Close socket
		if (this.socket) {
			this.socket.removeAllListeners();
			this.socket.close();
			this.socket = null;
		}

		// Clear handlers
		this.eventHandlers.clear();

		console.log('[WebSocketManager] Closed');
	}

	/**
	 * Check if connected
	 */
	isConnected(): boolean {
		return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
	}

	/**
	 * Get current reconnection state
	 */
	getReconnectionState(): ReconnectionState {
		return { ...this.reconnectionState };
	}
}
