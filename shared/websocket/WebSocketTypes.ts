/**
 * TypeScript interfaces for Pterodactyl WebSocket implementation
 */

/**
 * Response from Pterodactyl WebSocket token endpoint
 */
export interface WebSocketTokenResponse {
	token: string;
	socket: string;
}

/**
 * WebSocket event from Pterodactyl server
 */
export interface WebSocketEvent {
	event: string;
	args: any[];
}

/**
 * WebSocket command to send to Pterodactyl server
 */
export interface WebSocketCommand {
	event: string;
	args: any[];
}

/**
 * Event batching configuration options
 */
export interface BatchOptions {
	/** Batch interval in milliseconds */
	interval: number;
	/** Maximum events per batch */
	maxBurst: number;
	/** Whether to discard excess events or queue them */
	discardExcess?: boolean;
}

/**
 * WebSocket manager configuration
 */
export interface WebSocketManagerConfig {
	/** Server ID */
	serverId: string;
	/** API key for authentication */
	apiKey: string;
	/** Panel URL */
	panelUrl: string;
	/** Whether to enable auto-reconnect */
	autoReconnect?: boolean;
	/** Maximum reconnection attempts */
	maxReconnectAttempts?: number;
	/** Whether to enable heartbeat/ping */
	enableHeartbeat?: boolean;
	/** Heartbeat interval in milliseconds */
	heartbeatInterval?: number;
}

/**
 * Event handler function type
 */
export type EventHandler = (data: any) => void | Promise<void>;

/**
 * Reconnection state
 */
export interface ReconnectionState {
	/** Current attempt number */
	attempt: number;
	/** Next delay in milliseconds */
	delay: number;
	/** Whether reconnection is in progress */
	inProgress: boolean;
}
