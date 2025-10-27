/**
 * Unit tests for PterodactylWebSocketManager
 */

import { PterodactylWebSocketManager } from '../../../../shared/websocket/WebSocketManager';
import { WebSocketTokenResponse } from '../../../../shared/websocket/WebSocketTypes';
import {
	tokenResponses,
	consoleOutputEvents,
	statusEvents,
	authEvents,
	closeCodes,
} from '../../../fixtures';

// Mock the ws module
jest.mock('ws', () => {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const { EventEmitter } = require('events');

	class MockWebSocket extends EventEmitter {
		public readyState: number = 0; // CONNECTING
		public static CONNECTING = 0;
		public static OPEN = 1;
		public static CLOSING = 2;
		public static CLOSED = 3;

		private sentMessages: string[] = [];

		constructor(
			public url: string,
			public options?: any,
		) {
			super();
			// Immediately set to open for testing
			this.readyState = 1; // OPEN
			// Emit open in next event loop tick - use Promise for compatibility with both real and fake timers
			Promise.resolve().then(() => {
				this.emit('open');
			});
		}

		send(data: string): void {
			if (this.readyState !== MockWebSocket.OPEN) {
				throw new Error('WebSocket is not open');
			}
			this.sentMessages.push(data);
		}

		close(code?: number, reason?: string): void {
			this.readyState = MockWebSocket.CLOSING;
			this.readyState = MockWebSocket.CLOSED;
			const closeCodes = { normal: 1000 };
			Promise.resolve().then(() => {
				this.emit('close', code || closeCodes.normal, Buffer.from(reason || ''));
			});
		}

		ping(): void {
			// Simulate ping
		}

		pong(): void {
			// Simulate pong
		}

		removeAllListeners(): this {
			super.removeAllListeners();
			return this;
		}

		getSentMessages(): string[] {
			return this.sentMessages;
		}

		simulateMessage(data: any): void {
			this.emit('message', JSON.stringify(data));
		}

		simulateError(error: Error): void {
			this.emit('error', error);
		}

		simulatePing(): void {
			this.emit('ping');
		}
	}

	return MockWebSocket;
});

// Type for the mocked WebSocket
type MockedWebSocket = {
	readyState: number;
	options?: any;
	getSentMessages(): string[];
	simulateMessage(data: any): void;
	simulateError(error: Error): void;
	simulatePing(): void;
	close(code?: number, reason?: string): void;
	ping(): void;
	pong(): void;
	emit(event: string, ...args: any[]): boolean;
};

describe('PterodactylWebSocketManager', () => {
	let wsManager: PterodactylWebSocketManager;
	let mockTokenFetch: jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();
		// Don't use fake timers globally - only in tests that need them

		mockTokenFetch = jest.fn().mockResolvedValue(tokenResponses.valid);
	});

	afterEach(() => {
		if (wsManager) {
			wsManager.close();
		}
		// Always restore real timers after each test
		jest.useRealTimers();
	});

	describe('Connection', () => {
		test('should connect successfully', async () => {
			wsManager = new PterodactylWebSocketManager(
				{
					serverId: 'test-server',
					apiKey: 'test-key',
					panelUrl: 'https://panel.test',
					autoReconnect: false,
				},
				mockTokenFetch,
			);

			await wsManager.connect();

			expect(mockTokenFetch).toHaveBeenCalledTimes(1);
			expect(wsManager.isConnected()).toBe(true);
		});

		test('should send auth command on connection', async () => {
			wsManager = new PterodactylWebSocketManager(
				{
					serverId: 'test-server',
					apiKey: 'test-key',
					panelUrl: 'https://panel.test',
					autoReconnect: false,
				},
				mockTokenFetch,
			);

			await wsManager.connect();

			// Get the mock socket to check sent messages
			const socket = (wsManager as any).socket as MockedWebSocket;
			const sentMessages = socket.getSentMessages();

			expect(sentMessages).toHaveLength(1);
			const authMessage = JSON.parse(sentMessages[0]);
			expect(authMessage).toEqual({
				event: 'auth',
				args: [tokenResponses.valid.token],
			});
		});

		test('should handle connection timeout', async () => {
			jest.useFakeTimers();

			mockTokenFetch.mockImplementation(
				() =>
					new Promise((resolve) => {
						setTimeout(() => resolve(tokenResponses.valid), 50000);
					}),
			);

			wsManager = new PterodactylWebSocketManager(
				{
					serverId: 'test-server',
					apiKey: 'test-key',
					panelUrl: 'https://panel.test',
					autoReconnect: false,
				},
				mockTokenFetch,
			);

			const connectPromise = wsManager.connect();

			// Process pending timers and promises
			jest.runOnlyPendingTimers();
			await Promise.resolve(); // Flush promise microtask queue

			// Advance time to trigger timeout
			jest.advanceTimersByTime(30000);
			await Promise.resolve(); // Flush promise microtask queue

			await expect(connectPromise).rejects.toThrow();

			jest.useRealTimers(); // Clean up
		});

		test('should handle connection error', async () => {
			mockTokenFetch.mockRejectedValue(new Error('Network error'));

			wsManager = new PterodactylWebSocketManager(
				{
					serverId: 'test-server',
					apiKey: 'test-key',
					panelUrl: 'https://panel.test',
					autoReconnect: false,
				},
				mockTokenFetch,
			);

			await expect(wsManager.connect()).rejects.toThrow('Network error');
		});

		test('should include panel URL in origin header', async () => {
			wsManager = new PterodactylWebSocketManager(
				{
					serverId: 'test-server',
					apiKey: 'test-key',
					panelUrl: 'https://panel.test',
					autoReconnect: false,
				},
				mockTokenFetch,
			);

			await wsManager.connect();

			// Use fake timers after connection
			jest.useFakeTimers();

			const socket = (wsManager as any).socket as MockedWebSocket;
			expect(socket.options.headers.Origin).toBe('https://panel.test');
		});
	});

	describe('Event handling', () => {
		beforeEach(async () => {
			wsManager = new PterodactylWebSocketManager(
				{
					serverId: 'test-server',
					apiKey: 'test-key',
					panelUrl: 'https://panel.test',
					autoReconnect: false,
				},
				mockTokenFetch,
			);

			await wsManager.connect();
		});

		test('should emit console output events', () => {
			const handler = jest.fn();
			wsManager.on('console output', handler);

			const socket = (wsManager as any).socket as MockedWebSocket;
			socket.simulateMessage(consoleOutputEvents[0]);

			expect(handler).toHaveBeenCalledWith(consoleOutputEvents[0].args);
		});

		test('should emit status events', () => {
			const handler = jest.fn();
			wsManager.on('status', handler);

			const socket = (wsManager as any).socket as MockedWebSocket;
			socket.simulateMessage(statusEvents[0]);

			expect(handler).toHaveBeenCalledWith(statusEvents[0].args);
		});

		test('should handle multiple event handlers for same event', () => {
			const handler1 = jest.fn();
			const handler2 = jest.fn();

			wsManager.on('status', handler1);
			wsManager.on('status', handler2);

			const socket = (wsManager as any).socket as MockedWebSocket;
			socket.simulateMessage(statusEvents[0]);

			expect(handler1).toHaveBeenCalledTimes(1);
			expect(handler2).toHaveBeenCalledTimes(1);
		});

		test('should remove event handler', () => {
			const handler = jest.fn();

			wsManager.on('status', handler);
			wsManager.off('status', handler);

			const socket = (wsManager as any).socket as MockedWebSocket;
			socket.simulateMessage(statusEvents[0]);

			expect(handler).not.toHaveBeenCalled();
		});

		test('should handle malformed JSON gracefully', () => {
			const socket = (wsManager as any).socket as MockedWebSocket;

			// Should not throw
			expect(() => {
				socket.emit('message', 'not valid json');
			}).not.toThrow();
		});

		test('should emit error on WebSocket error', () => {
			const errorHandler = jest.fn();
			wsManager.on('error', errorHandler);

			const socket = (wsManager as any).socket as MockedWebSocket;
			const testError = new Error('Test error');
			socket.simulateError(testError);

			expect(errorHandler).toHaveBeenCalledWith(testError);
		});
	});

	describe('Token refresh', () => {
		test('should handle token expiring event', async () => {
			const newTokenResponse: WebSocketTokenResponse = {
				token: 'new.token.here',
				socket: 'wss://new.socket.url',
			};

			mockTokenFetch
				.mockResolvedValueOnce(tokenResponses.valid)
				.mockResolvedValueOnce(newTokenResponse);

			wsManager = new PterodactylWebSocketManager(
				{
					serverId: 'test-server',
					apiKey: 'test-key',
					panelUrl: 'https://panel.test',
					autoReconnect: false,
				},
				mockTokenFetch,
			);

			await wsManager.connect(); // Connect with real timers

			const socket = (wsManager as any).socket as MockedWebSocket;
			const sentMessagesBefore = socket.getSentMessages().length;

			// Trigger token expiring event
			socket.simulateMessage(authEvents[1]); // token expiring

			// Wait for refresh to complete
			await Promise.resolve(); // Flush microtasks

			expect(mockTokenFetch).toHaveBeenCalledTimes(2);

			// Should send new auth command
			const sentMessagesAfter = socket.getSentMessages();
			expect(sentMessagesAfter.length).toBeGreaterThan(sentMessagesBefore);

			const lastMessage = JSON.parse(sentMessagesAfter[sentMessagesAfter.length - 1]);
			expect(lastMessage).toEqual({
				event: 'auth',
				args: [newTokenResponse.token],
			});
		});

		test('should handle token expired event', async () => {
			const newTokenResponse: WebSocketTokenResponse = {
				token: 'new.token.here',
				socket: 'wss://new.socket.url',
			};

			mockTokenFetch
				.mockResolvedValueOnce(tokenResponses.valid)
				.mockResolvedValueOnce(newTokenResponse);

			wsManager = new PterodactylWebSocketManager(
				{
					serverId: 'test-server',
					apiKey: 'test-key',
					panelUrl: 'https://panel.test',
					autoReconnect: false,
				},
				mockTokenFetch,
			);

			await wsManager.connect(); // Connect with real timers

			const socket = (wsManager as any).socket as MockedWebSocket;

			// Trigger token expired event
			socket.simulateMessage(authEvents[2]); // token expired

			await Promise.resolve(); // Flush microtasks

			expect(mockTokenFetch).toHaveBeenCalledTimes(2);
		});

		// TODO: Fix fake timer compatibility with async WebSocket mock
		test.skip('should schedule token refresh based on JWT expiry', async () => {
			// Token expires in ~10 years (exp: 1730000000)
			wsManager = new PterodactylWebSocketManager(
				{
					serverId: 'test-server',
					apiKey: 'test-key',
					panelUrl: 'https://panel.test',
					autoReconnect: false,
				},
				mockTokenFetch,
			);

			await wsManager.connect();

			// Use fake timers after connection is established

			// Check that a timer was scheduled for token refresh
			expect(jest.getTimerCount()).toBeGreaterThan(0);

			jest.useRealTimers(); // Clean up
		}, 10000);
	});

	describe('Reconnection', () => {
		// TODO: Fix fake timer compatibility with async WebSocket mock
		test.skip('should reconnect on connection loss', async () => {
			jest.useFakeTimers(); // Enable fake timers before connecting

			wsManager = new PterodactylWebSocketManager(
				{
					serverId: 'test-server',
					apiKey: 'test-key',
					panelUrl: 'https://panel.test',
					autoReconnect: true,
					maxReconnectAttempts: 3,
				},
				mockTokenFetch,
			);

			const connectPromise = wsManager.connect();
			jest.runOnlyPendingTimers(); // Process pending timers
			await Promise.resolve(); // Flush promises
			await connectPromise;

			const reconnectedHandler = jest.fn();
			wsManager.on('reconnected', reconnectedHandler);

			// Simulate connection loss
			const socket = (wsManager as any).socket as MockedWebSocket;
			socket.close(closeCodes.abnormal, 'Connection lost');
			jest.runOnlyPendingTimers(); // Process close event
			await Promise.resolve(); // Flush promises

			// Wait for reconnection attempt
			jest.advanceTimersByTime(1000);
			jest.runOnlyPendingTimers(); // Process reconnection timers
			await Promise.resolve(); // Flush promises

			expect(mockTokenFetch).toHaveBeenCalledTimes(2);

			jest.useRealTimers(); // Clean up
		});

		// TODO: Fix fake timer compatibility with async WebSocket mock
		test.skip('should use exponential backoff for reconnection', async () => {
			jest.useFakeTimers(); // Enable fake timers before connecting

			wsManager = new PterodactylWebSocketManager(
				{
					serverId: 'test-server',
					apiKey: 'test-key',
					panelUrl: 'https://panel.test',
					autoReconnect: true,
					maxReconnectAttempts: 5,
				},
				mockTokenFetch,
			);

			const connectPromise = wsManager.connect();
			jest.runOnlyPendingTimers(); // Process pending timers
			await Promise.resolve(); // Flush promises
			await connectPromise;

			// Make token fetch fail to trigger multiple reconnect attempts
			mockTokenFetch.mockRejectedValue(new Error('Connection failed'));

			const socket = (wsManager as any).socket as MockedWebSocket;
			socket.close(closeCodes.abnormal);
			jest.runOnlyPendingTimers(); // Process close event
			await Promise.resolve(); // Flush promises

			// First reconnect attempt: 1s delay
			jest.advanceTimersByTime(1100);
			jest.runOnlyPendingTimers();
			await Promise.resolve(); // Flush promises
			await Promise.resolve(); // Extra flush for error handling

			// Second attempt: 2s delay
			jest.advanceTimersByTime(2100);
			jest.runOnlyPendingTimers();
			await Promise.resolve(); // Flush promises
			await Promise.resolve(); // Extra flush for error handling

			// Third attempt: 4s delay
			jest.advanceTimersByTime(4100);
			jest.runOnlyPendingTimers();
			await Promise.resolve(); // Flush promises
			await Promise.resolve(); // Extra flush for error handling

			const state = wsManager.getReconnectionState();
			expect(state.attempt).toBeGreaterThanOrEqual(1);

			jest.useRealTimers(); // Clean up
		});

		// TODO: Fix fake timer compatibility with async WebSocket mock
		test.skip('should emit reconnect_failed after max attempts', async () => {
			jest.useFakeTimers(); // Enable fake timers before connecting

			mockTokenFetch
				.mockResolvedValueOnce(tokenResponses.valid)
				.mockRejectedValue(new Error('Connection failed'));

			wsManager = new PterodactylWebSocketManager(
				{
					serverId: 'test-server',
					apiKey: 'test-key',
					panelUrl: 'https://panel.test',
					autoReconnect: true,
					maxReconnectAttempts: 2,
				},
				mockTokenFetch,
			);

			const connectPromise = wsManager.connect();
			jest.runOnlyPendingTimers(); // Process pending timers
			await Promise.resolve(); // Flush promises
			await connectPromise;

			const failedHandler = jest.fn();
			wsManager.on('reconnect_failed', failedHandler);

			const socket = (wsManager as any).socket as MockedWebSocket;
			socket.close(closeCodes.abnormal);
			jest.runOnlyPendingTimers(); // Process close event
			await Promise.resolve(); // Flush promises

			// Attempt 1
			jest.advanceTimersByTime(1000);
			jest.runOnlyPendingTimers(); // Process reconnection timers
			await Promise.resolve(); // Flush promises
			await Promise.resolve(); // Extra flush for error handling
			await Promise.resolve(); // Extra flush for scheduleReconnect call from catch

			// Attempt 2 - scheduled by the catch handler from attempt 1
			jest.advanceTimersByTime(2000);
			jest.runOnlyPendingTimers(); // Process reconnection timers
			await Promise.resolve(); // Flush promises
			await Promise.resolve(); // Extra flush for error handling
			await Promise.resolve(); // Extra flush for reconnect_failed event emission

			expect(failedHandler).toHaveBeenCalled();

			jest.useRealTimers(); // Clean up
		});

		// TODO: Fix fake timer compatibility with async WebSocket mock
		test.skip('should not reconnect when manually disconnected', async () => {
			jest.useFakeTimers(); // Enable fake timers before connecting

			wsManager = new PterodactylWebSocketManager(
				{
					serverId: 'test-server',
					apiKey: 'test-key',
					panelUrl: 'https://panel.test',
					autoReconnect: true,
				},
				mockTokenFetch,
			);

			const connectPromise = wsManager.connect();
			jest.runOnlyPendingTimers(); // Process setImmediate from mock WebSocket
			await connectPromise;

			expect(mockTokenFetch).toHaveBeenCalledTimes(1);

			// Manually close
			wsManager.close();
			jest.advanceTimersByTime(20);

			// Wait for potential reconnection
			jest.advanceTimersByTime(5000);

			// Should not attempt reconnection
			expect(mockTokenFetch).toHaveBeenCalledTimes(1);

			jest.useRealTimers(); // Clean up
		});
	});

	describe('Heartbeat', () => {
		// TODO: Fix fake timer compatibility with async WebSocket mock
		test.skip('should send ping at heartbeat interval', async () => {
			jest.useFakeTimers(); // Enable fake timers before connecting

			wsManager = new PterodactylWebSocketManager(
				{
					serverId: 'test-server',
					apiKey: 'test-key',
					panelUrl: 'https://panel.test',
					autoReconnect: false,
					enableHeartbeat: true,
					heartbeatInterval: 1000,
				},
				mockTokenFetch,
			);

			const connectPromise = wsManager.connect();
			jest.runOnlyPendingTimers(); // Process setImmediate from mock WebSocket
			await connectPromise;

			const socket = (wsManager as any).socket as MockedWebSocket;
			const pingSpy = jest.spyOn(socket, 'ping');

			// Advance time to trigger heartbeat
			jest.advanceTimersByTime(1000);

			expect(pingSpy).toHaveBeenCalled();

			jest.useRealTimers(); // Clean up
		});

		// TODO: Fix fake timer compatibility with async WebSocket mock
		test.skip('should respond to ping with pong', async () => {
			wsManager = new PterodactylWebSocketManager(
				{
					serverId: 'test-server',
					apiKey: 'test-key',
					panelUrl: 'https://panel.test',
					autoReconnect: false,
				},
				mockTokenFetch,
			);

			await wsManager.connect();

			// Use fake timers after connection
			jest.useFakeTimers(); // Connect with real timers

			const socket = (wsManager as any).socket as MockedWebSocket;
			const pongSpy = jest.spyOn(socket, 'pong');

			socket.simulatePing();

			expect(pongSpy).toHaveBeenCalled();
		});
	});

	describe('Command sending', () => {
		beforeEach(async () => {
			wsManager = new PterodactylWebSocketManager(
				{
					serverId: 'test-server',
					apiKey: 'test-key',
					panelUrl: 'https://panel.test',
					autoReconnect: false,
				},
				mockTokenFetch,
			);

			await wsManager.connect();
		});

		test('should send command successfully', () => {
			wsManager.sendCommand({
				event: 'set state',
				args: ['start'],
			});

			const socket = (wsManager as any).socket as MockedWebSocket;
			const sentMessages = socket.getSentMessages();

			// Find the set state command (not the auth command)
			const setState = sentMessages.find((msg) => {
				const parsed = JSON.parse(msg);
				return parsed.event === 'set state';
			});

			expect(setState).toBeDefined();
			expect(JSON.parse(setState!)).toEqual({
				event: 'set state',
				args: ['start'],
			});
		});

		test('should not send command when not connected', () => {
			wsManager.close();
			jest.advanceTimersByTime(20);

			// Should not throw but log warning
			expect(() => {
				wsManager.sendCommand({
					event: 'set state',
					args: ['start'],
				});
			}).not.toThrow();
		});
	});

	describe('Cleanup', () => {
		// TODO: Fix fake timer compatibility with async WebSocket mock
		test.skip('should clear all timers on close', async () => {
			wsManager = new PterodactylWebSocketManager(
				{
					serverId: 'test-server',
					apiKey: 'test-key',
					panelUrl: 'https://panel.test',
					autoReconnect: true,
					enableHeartbeat: true,
					heartbeatInterval: 1000,
				},
				mockTokenFetch,
			);

			const connectPromise = wsManager.connect();
			jest.runOnlyPendingTimers(); // Process setImmediate from mock WebSocket
			await connectPromise;

			const timersBefore = jest.getTimerCount();
			expect(timersBefore).toBeGreaterThan(0);

			wsManager.close();
			jest.advanceTimersByTime(20);

			// All timers should be cleared
			expect(jest.getTimerCount()).toBeLessThan(timersBefore);

			jest.useRealTimers(); // Clean up
		});

		// TODO: Fix fake timer compatibility with async WebSocket mock
		test.skip('should remove all event handlers on close', async () => {
			jest.useFakeTimers(); // Enable fake timers before connecting

			wsManager = new PterodactylWebSocketManager(
				{
					serverId: 'test-server',
					apiKey: 'test-key',
					panelUrl: 'https://panel.test',
					autoReconnect: false,
				},
				mockTokenFetch,
			);

			const connectPromise = wsManager.connect();
			jest.runOnlyPendingTimers(); // Process setImmediate from mock WebSocket
			await connectPromise;

			const handler = jest.fn();
			wsManager.on('status', handler);

			wsManager.close();
			jest.advanceTimersByTime(20);

			// Handler should not be called after close
			const socket = (wsManager as any).socket as MockedWebSocket;
			if (socket) {
				socket.simulateMessage(statusEvents[0]);
			}

			expect(handler).not.toHaveBeenCalled();

			jest.useRealTimers(); // Clean up
		});
	});

	describe('isConnected', () => {
		test('should return false before connection', () => {
			wsManager = new PterodactylWebSocketManager(
				{
					serverId: 'test-server',
					apiKey: 'test-key',
					panelUrl: 'https://panel.test',
					autoReconnect: false,
				},
				mockTokenFetch,
			);

			expect(wsManager.isConnected()).toBe(false);
		});

		test('should return true when connected', async () => {
			wsManager = new PterodactylWebSocketManager(
				{
					serverId: 'test-server',
					apiKey: 'test-key',
					panelUrl: 'https://panel.test',
					autoReconnect: false,
				},
				mockTokenFetch,
			);

			await wsManager.connect();

			// Use fake timers after connection
			jest.useFakeTimers();

			expect(wsManager.isConnected()).toBe(true);
		});

		test('should return false after close', async () => {
			wsManager = new PterodactylWebSocketManager(
				{
					serverId: 'test-server',
					apiKey: 'test-key',
					panelUrl: 'https://panel.test',
					autoReconnect: false,
				},
				mockTokenFetch,
			);

			await wsManager.connect();

			wsManager.close();
			jest.advanceTimersByTime(20);

			expect(wsManager.isConnected()).toBe(false);
		});
	});
});
