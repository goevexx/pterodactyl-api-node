/**
 * Unit tests for PterodactylWebsocketTrigger throttling behavior
 */

import { PterodactylWebsocketTrigger } from '../../../../nodes/PterodactylWebsocketTrigger/PterodactylWebsocketTrigger.trigger.node';
import { mockCredentials, tokenResponses } from '../../../fixtures';

// Mock the transport module
jest.mock('../../../../shared/transport', () => ({
	pterodactylApiRequest: jest.fn(),
}));

// Create mock with event handler tracking
let mockEventHandlers: Map<string, ((...args: any[]) => void)[]>;

jest.mock('../../../../shared/websocket/WebSocketManager', () => {
	return {
		PterodactylWebSocketManager: jest.fn().mockImplementation(() => {
			mockEventHandlers = new Map();

			return {
				connect: jest.fn().mockResolvedValue(undefined),
				on: jest.fn((event: string, handler: (...args: any[]) => void) => {
					if (!mockEventHandlers.has(event)) {
						mockEventHandlers.set(event, []);
					}
					mockEventHandlers.get(event)!.push(handler);
				}),
				close: jest.fn(),
				sendCommand: jest.fn(),
				_triggerEvent: (event: string, data: any) => {
					const handlers = mockEventHandlers.get(event);
					if (handlers) {
						handlers.forEach((handler) => handler(data));
					}
				},
			};
		}),
	};
});

import { pterodactylApiRequest } from '../../../../shared/transport';
import { PterodactylWebSocketManager } from '../../../../shared/websocket/WebSocketManager';

describe('PterodactylWebsocketTrigger - Throttling', () => {
	let triggerNode: PterodactylWebsocketTrigger;
	let mockTriggerFunctions: any;
	let mockEmit: jest.Mock;
	let mockHelpers: any;
	let wsManagerInstance: any;

	beforeEach(() => {
		jest.clearAllMocks();
		jest.useFakeTimers();
		mockEventHandlers = new Map();

		mockEmit = jest.fn();
		mockHelpers = {
			returnJsonArray: jest.fn((data) => data),
		};

		(pterodactylApiRequest as jest.Mock).mockResolvedValue({
			data: tokenResponses.valid,
		});

		triggerNode = new PterodactylWebsocketTrigger();
	});

	afterEach(() => {
		jest.clearAllTimers();
		jest.useRealTimers();
	});

	describe('Throttling Enabled', () => {
		test('should throttle high-frequency events', async () => {
			mockTriggerFunctions = {
				getNodeParameter: jest.fn((param: string) => {
					if (param === 'serverId') return 'test-server';
					if (param === 'events') return ['*'];
					if (param === 'options') {
						return {
							throttleEnabled: true,
							throttleInterval: 100,
							throttleMaxBurst: 3,
							discardExcess: false,
						};
					}
					return undefined;
				}),
				getCredentials: jest.fn().mockResolvedValue(mockCredentials.valid),
				emit: mockEmit,
				helpers: mockHelpers,
			};

			await triggerNode.trigger.call(mockTriggerFunctions);

			wsManagerInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;

			// Send 5 events rapidly
			for (let i = 0; i < 5; i++) {
				wsManagerInstance._triggerEvent('console output', [`Message ${i + 1}`]);
			}

			// Only first 3 should be emitted immediately (burst limit)
			expect(mockEmit).toHaveBeenCalledTimes(3);

			// Advance time to emit queued events
			jest.advanceTimersByTime(100);
			expect(mockEmit).toHaveBeenCalledTimes(4);

			jest.advanceTimersByTime(100);
			expect(mockEmit).toHaveBeenCalledTimes(5);
		});

		test('should respect throttle interval', async () => {
			mockTriggerFunctions = {
				getNodeParameter: jest.fn((param: string) => {
					if (param === 'serverId') return 'test-server';
					if (param === 'events') return ['*'];
					if (param === 'options') {
						return {
							throttleEnabled: true,
							throttleInterval: 200,
							throttleMaxBurst: 2,
							discardExcess: false,
						};
					}
					return undefined;
				}),
				getCredentials: jest.fn().mockResolvedValue(mockCredentials.valid),
				emit: mockEmit,
				helpers: mockHelpers,
			};

			await triggerNode.trigger.call(mockTriggerFunctions);

			wsManagerInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;

			// Send 3 events
			wsManagerInstance._triggerEvent('console output', ['Message 1']);
			wsManagerInstance._triggerEvent('console output', ['Message 2']);
			wsManagerInstance._triggerEvent('console output', ['Message 3']);

			expect(mockEmit).toHaveBeenCalledTimes(2);

			// Advance by interval (200ms)
			jest.advanceTimersByTime(200);

			expect(mockEmit).toHaveBeenCalledTimes(3);
		});

		test('should respect burst limit', async () => {
			mockTriggerFunctions = {
				getNodeParameter: jest.fn((param: string) => {
					if (param === 'serverId') return 'test-server';
					if (param === 'events') return ['*'];
					if (param === 'options') {
						return {
							throttleEnabled: true,
							throttleInterval: 100,
							throttleMaxBurst: 5,
							discardExcess: false,
						};
					}
					return undefined;
				}),
				getCredentials: jest.fn().mockResolvedValue(mockCredentials.valid),
				emit: mockEmit,
				helpers: mockHelpers,
			};

			await triggerNode.trigger.call(mockTriggerFunctions);

			wsManagerInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;

			// Send 10 events
			for (let i = 0; i < 10; i++) {
				wsManagerInstance._triggerEvent('status', [`status-${i}`]);
			}

			// First 5 should be emitted immediately (burst limit)
			expect(mockEmit).toHaveBeenCalledTimes(5);
		});

		test('should discard excess events when discardExcess is true', async () => {
			mockTriggerFunctions = {
				getNodeParameter: jest.fn((param: string) => {
					if (param === 'serverId') return 'test-server';
					if (param === 'events') return ['*'];
					if (param === 'options') {
						return {
							throttleEnabled: true,
							throttleInterval: 100,
							throttleMaxBurst: 2,
							discardExcess: true,
						};
					}
					return undefined;
				}),
				getCredentials: jest.fn().mockResolvedValue(mockCredentials.valid),
				emit: mockEmit,
				helpers: mockHelpers,
			};

			await triggerNode.trigger.call(mockTriggerFunctions);

			wsManagerInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;

			// Send 5 events
			for (let i = 0; i < 5; i++) {
				wsManagerInstance._triggerEvent('console output', [`Message ${i + 1}`]);
			}

			// Only first 2 should be emitted
			expect(mockEmit).toHaveBeenCalledTimes(2);

			// Advance time - no more events should be emitted (discarded)
			jest.advanceTimersByTime(200);
			expect(mockEmit).toHaveBeenCalledTimes(2);
		});
	});

	describe('Throttling Disabled', () => {
		test('should emit all events immediately when throttling disabled', async () => {
			mockTriggerFunctions = {
				getNodeParameter: jest.fn((param: string) => {
					if (param === 'serverId') return 'test-server';
					if (param === 'events') return ['*'];
					if (param === 'options') {
						return {
							throttleEnabled: false,
						};
					}
					return undefined;
				}),
				getCredentials: jest.fn().mockResolvedValue(mockCredentials.valid),
				emit: mockEmit,
				helpers: mockHelpers,
			};

			await triggerNode.trigger.call(mockTriggerFunctions);

			wsManagerInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;

			// Send 10 events rapidly
			for (let i = 0; i < 10; i++) {
				wsManagerInstance._triggerEvent('console output', [`Message ${i + 1}`]);
			}

			// All should be emitted immediately
			expect(mockEmit).toHaveBeenCalledTimes(10);
		});

		test('should not queue events when throttling disabled', async () => {
			mockTriggerFunctions = {
				getNodeParameter: jest.fn((param: string) => {
					if (param === 'serverId') return 'test-server';
					if (param === 'events') return ['*'];
					if (param === 'options') {
						return {
							throttleEnabled: false,
						};
					}
					return undefined;
				}),
				getCredentials: jest.fn().mockResolvedValue(mockCredentials.valid),
				emit: mockEmit,
				helpers: mockHelpers,
			};

			await triggerNode.trigger.call(mockTriggerFunctions);

			wsManagerInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;

			// Send events
			wsManagerInstance._triggerEvent('status', ['running']);
			wsManagerInstance._triggerEvent('status', ['stopping']);

			expect(mockEmit).toHaveBeenCalledTimes(2);

			// Advance time - no additional events
			jest.advanceTimersByTime(1000);
			expect(mockEmit).toHaveBeenCalledTimes(2);
		});
	});

	describe('Default Throttling Behavior', () => {
		test('should use default throttle settings when not specified', async () => {
			mockTriggerFunctions = {
				getNodeParameter: jest.fn((param: string) => {
					if (param === 'serverId') return 'test-server';
					if (param === 'events') return ['*'];
					if (param === 'options') {
						return {}; // Empty options, should use defaults
					}
					return undefined;
				}),
				getCredentials: jest.fn().mockResolvedValue(mockCredentials.valid),
				emit: mockEmit,
				helpers: mockHelpers,
			};

			await triggerNode.trigger.call(mockTriggerFunctions);

			// Should create trigger without error
			expect(PterodactylWebSocketManager).toHaveBeenCalled();
		});

		test('should enable throttling by default', async () => {
			mockTriggerFunctions = {
				getNodeParameter: jest.fn((param: string) => {
					if (param === 'serverId') return 'test-server';
					if (param === 'events') return ['*'];
					if (param === 'options') {
						return {
							// throttleEnabled not specified, should default to true
							throttleInterval: 50,
							throttleMaxBurst: 2,
						};
					}
					return undefined;
				}),
				getCredentials: jest.fn().mockResolvedValue(mockCredentials.valid),
				emit: mockEmit,
				helpers: mockHelpers,
			};

			await triggerNode.trigger.call(mockTriggerFunctions);

			wsManagerInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;

			// Send 5 events - should be throttled
			for (let i = 0; i < 5; i++) {
				wsManagerInstance._triggerEvent('console output', [`Message ${i + 1}`]);
			}

			// Should be throttled (not all 5 emitted immediately)
			expect(mockEmit.mock.calls.length).toBeLessThan(5);
		});
	});

	describe('Mixed Event Types with Throttling', () => {
		test('should throttle different event types together', async () => {
			mockTriggerFunctions = {
				getNodeParameter: jest.fn((param: string) => {
					if (param === 'serverId') return 'test-server';
					if (param === 'events') return ['*'];
					if (param === 'options') {
						return {
							throttleEnabled: true,
							throttleInterval: 100,
							throttleMaxBurst: 3,
							discardExcess: false,
						};
					}
					return undefined;
				}),
				getCredentials: jest.fn().mockResolvedValue(mockCredentials.valid),
				emit: mockEmit,
				helpers: mockHelpers,
			};

			await triggerNode.trigger.call(mockTriggerFunctions);

			wsManagerInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;

			// Send mixed event types
			wsManagerInstance._triggerEvent('console output', ['Message 1']);
			wsManagerInstance._triggerEvent('status', ['running']);
			wsManagerInstance._triggerEvent('stats', [{}]);
			wsManagerInstance._triggerEvent('console output', ['Message 2']);
			wsManagerInstance._triggerEvent('status', ['stopping']);

			// First 3 events should be emitted immediately
			expect(mockEmit).toHaveBeenCalledTimes(3);

			// Verify event types
			expect(mockEmit.mock.calls[0][0][0][0].json.event).toBe('console output');
			expect(mockEmit.mock.calls[1][0][0][0].json.event).toBe('status');
			expect(mockEmit.mock.calls[2][0][0][0].json.event).toBe('stats');
		});
	});

	describe('Cleanup with Throttling', () => {
		test('should clear throttler on close', async () => {
			mockTriggerFunctions = {
				getNodeParameter: jest.fn((param: string) => {
					if (param === 'serverId') return 'test-server';
					if (param === 'events') return ['*'];
					if (param === 'options') {
						return {
							throttleEnabled: true,
							throttleInterval: 100,
							throttleMaxBurst: 2,
							discardExcess: false,
						};
					}
					return undefined;
				}),
				getCredentials: jest.fn().mockResolvedValue(mockCredentials.valid),
				emit: mockEmit,
				helpers: mockHelpers,
			};

			const result = await triggerNode.trigger.call(mockTriggerFunctions);

			wsManagerInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;

			// Queue some events
			wsManagerInstance._triggerEvent('console output', ['Message 1']);
			wsManagerInstance._triggerEvent('console output', ['Message 2']);
			wsManagerInstance._triggerEvent('console output', ['Message 3']); // Queued

			expect(mockEmit).toHaveBeenCalledTimes(2);

			// Close the trigger
			await result.closeFunction!();

			// Advance time - queued event should not be emitted after close
			jest.advanceTimersByTime(200);
			expect(mockEmit).toHaveBeenCalledTimes(2);
		});

		test('should not throw when closing with active throttler', async () => {
			mockTriggerFunctions = {
				getNodeParameter: jest.fn((param: string) => {
					if (param === 'serverId') return 'test-server';
					if (param === 'events') return ['*'];
					if (param === 'options') {
						return {
							throttleEnabled: true,
							throttleInterval: 100,
							throttleMaxBurst: 5,
						};
					}
					return undefined;
				}),
				getCredentials: jest.fn().mockResolvedValue(mockCredentials.valid),
				emit: mockEmit,
				helpers: mockHelpers,
			};

			const result = await triggerNode.trigger.call(mockTriggerFunctions);

			// Should not throw
			await expect(result.closeFunction!()).resolves.not.toThrow();
		});
	});
});
