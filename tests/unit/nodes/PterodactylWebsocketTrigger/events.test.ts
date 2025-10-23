/**
 * Unit tests for PterodactylWebsocketTrigger event handling and filtering
 */

import { PterodactylWebsocketTrigger } from '../../../../nodes/PterodactylWebsocketTrigger/PterodactylWebsocketTrigger.trigger.node';
import {
	mockCredentials,
	tokenResponses,
	consoleOutputEvents,
	statusEvents,
	statsEvents,
} from '../../../fixtures';

// Mock the transport module
jest.mock('../../../../shared/transport', () => ({
	pterodactylApiRequest: jest.fn(),
}));

// Create a more detailed WebSocket manager mock for event testing
let mockEventHandlers: Map<string, Function[]>;

jest.mock('../../../../shared/websocket/WebSocketManager', () => {
	return {
		PterodactylWebSocketManager: jest.fn().mockImplementation(() => {
			mockEventHandlers = new Map();

			return {
				connect: jest.fn().mockResolvedValue(undefined),
				on: jest.fn((event: string, handler: Function) => {
					if (!mockEventHandlers.has(event)) {
						mockEventHandlers.set(event, []);
					}
					mockEventHandlers.get(event)!.push(handler);
				}),
				close: jest.fn(),
				sendCommand: jest.fn(),
				// Helper to trigger events in tests
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

describe('PterodactylWebsocketTrigger - Event Handling', () => {
	let triggerNode: PterodactylWebsocketTrigger;
	let mockTriggerFunctions: any;
	let mockEmit: jest.Mock;
	let mockHelpers: any;
	let wsManagerInstance: any;

	beforeEach(() => {
		jest.clearAllMocks();
		mockEventHandlers = new Map();

		mockEmit = jest.fn();
		mockHelpers = {
			returnJsonArray: jest.fn((data) => data),
		};

		mockTriggerFunctions = {
			getNodeParameter: jest.fn((param: string) => {
				if (param === 'serverId') return 'test-server';
				if (param === 'events') return ['*']; // Listen to all events by default
				if (param === 'options') return { throttleEnabled: false };
				return undefined;
			}),
			getCredentials: jest.fn().mockResolvedValue(mockCredentials.valid),
			emit: mockEmit,
			helpers: mockHelpers,
		};

		(pterodactylApiRequest as jest.Mock).mockResolvedValue({
			data: tokenResponses.valid,
		});

		triggerNode = new PterodactylWebsocketTrigger();
	});

	describe('Event Registration', () => {
		test('should register handlers for all event types', async () => {
			await triggerNode.trigger.call(mockTriggerFunctions);

			wsManagerInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;

			// Check that handlers were registered for main events
			expect(wsManagerInstance.on).toHaveBeenCalledWith('console output', expect.any(Function));
			expect(wsManagerInstance.on).toHaveBeenCalledWith('status', expect.any(Function));
			expect(wsManagerInstance.on).toHaveBeenCalledWith('stats', expect.any(Function));
			expect(wsManagerInstance.on).toHaveBeenCalledWith('daemon message', expect.any(Function));
			expect(wsManagerInstance.on).toHaveBeenCalledWith('jwt error', expect.any(Function));
		});


		test('should register handlers for token events', async () => {
			await triggerNode.trigger.call(mockTriggerFunctions);

			wsManagerInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;

			expect(wsManagerInstance.on).toHaveBeenCalledWith('token expiring', expect.any(Function));
			expect(wsManagerInstance.on).toHaveBeenCalledWith('token expired', expect.any(Function));
		});

		test('should register handlers for connection events', async () => {
			await triggerNode.trigger.call(mockTriggerFunctions);

			wsManagerInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;

			expect(wsManagerInstance.on).toHaveBeenCalledWith('error', expect.any(Function));
			expect(wsManagerInstance.on).toHaveBeenCalledWith('disconnected', expect.any(Function));
			expect(wsManagerInstance.on).toHaveBeenCalledWith('reconnected', expect.any(Function));
			expect(wsManagerInstance.on).toHaveBeenCalledWith('reconnect_failed', expect.any(Function));
		});
	});

	describe('Event Emission - All Events Filter', () => {
		test('should emit console output events', async () => {
			await triggerNode.trigger.call(mockTriggerFunctions);

			wsManagerInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;

			// Trigger a console output event
			wsManagerInstance._triggerEvent('console output', consoleOutputEvents[0].args);

			expect(mockEmit).toHaveBeenCalled();
			const emittedData = mockEmit.mock.calls[0][0][0][0];
			expect(emittedData.json.event).toBe('console output');
			expect(emittedData.json.data).toEqual(consoleOutputEvents[0].args);
		});

		test('should emit status events', async () => {
			await triggerNode.trigger.call(mockTriggerFunctions);

			wsManagerInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;

			wsManagerInstance._triggerEvent('status', statusEvents[0].args);

			expect(mockEmit).toHaveBeenCalled();
			const emittedData = mockEmit.mock.calls[0][0][0][0];
			expect(emittedData.json.event).toBe('status');
			expect(emittedData.json.data).toEqual(statusEvents[0].args);
		});

		test('should emit stats events', async () => {
			await triggerNode.trigger.call(mockTriggerFunctions);

			wsManagerInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;

			wsManagerInstance._triggerEvent('stats', statsEvents[0].args);

			expect(mockEmit).toHaveBeenCalled();
			const emittedData = mockEmit.mock.calls[0][0][0][0];
			expect(emittedData.json.event).toBe('stats');
			expect(emittedData.json.data).toEqual(statsEvents[0].args);
		});

		test('should include timestamp in emitted events', async () => {
			await triggerNode.trigger.call(mockTriggerFunctions);

			wsManagerInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;

			wsManagerInstance._triggerEvent('status', ['running']);

			const emittedData = mockEmit.mock.calls[0][0][0][0];
			expect(emittedData.json).toHaveProperty('timestamp');
			expect(typeof emittedData.json.timestamp).toBe('string');
		});

		test('should include serverId in emitted events', async () => {
			await triggerNode.trigger.call(mockTriggerFunctions);

			wsManagerInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;

			wsManagerInstance._triggerEvent('status', ['running']);

			const emittedData = mockEmit.mock.calls[0][0][0][0];
			expect(emittedData.json.serverId).toBe('test-server');
		});
	});

	describe('Event Filtering', () => {
		test('should only emit filtered events when specific events selected', async () => {
			// Configure to only listen to console output and status
			mockTriggerFunctions.getNodeParameter = jest.fn((param: string) => {
				if (param === 'serverId') return 'test-server';
				if (param === 'events') return ['console output', 'status'];
				if (param === 'options') return { throttleEnabled: false };
				return undefined;
			});

			await triggerNode.trigger.call(mockTriggerFunctions);

			wsManagerInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;

			// Trigger console output - should emit
			wsManagerInstance._triggerEvent('console output', ['test message']);
			expect(mockEmit).toHaveBeenCalledTimes(1);

			// Trigger status - should emit
			wsManagerInstance._triggerEvent('status', ['running']);
			expect(mockEmit).toHaveBeenCalledTimes(2);

			// Trigger stats - should NOT emit
			wsManagerInstance._triggerEvent('stats', [{}]);
			expect(mockEmit).toHaveBeenCalledTimes(2); // Still 2, not 3
		});

		test('should not emit events when no matching filter', async () => {
			mockTriggerFunctions.getNodeParameter = jest.fn((param: string) => {
				if (param === 'serverId') return 'test-server';
				if (param === 'events') return ['status']; // Only status
				if (param === 'options') return { throttleEnabled: false };
				return undefined;
			});

			await triggerNode.trigger.call(mockTriggerFunctions);

			wsManagerInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;

			// Trigger console output - should NOT emit
			wsManagerInstance._triggerEvent('console output', ['test']);
			expect(mockEmit).not.toHaveBeenCalled();

			// Trigger stats - should NOT emit
			wsManagerInstance._triggerEvent('stats', [{}]);
			expect(mockEmit).not.toHaveBeenCalled();

			// Trigger status - should emit
			wsManagerInstance._triggerEvent('status', ['running']);
			expect(mockEmit).toHaveBeenCalledTimes(1);
		});

		test('should emit all events when "*" filter is active', async () => {
			await triggerNode.trigger.call(mockTriggerFunctions);

			wsManagerInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;

			const testEvents = [
				{ name: 'console output', data: ['test'] },
				{ name: 'status', data: ['running'] },
				{ name: 'stats', data: [{}] },
				{ name: 'daemon message', data: ['test'] },
			];

			testEvents.forEach((event) => {
				wsManagerInstance._triggerEvent(event.name, event.data);
			});

			expect(mockEmit).toHaveBeenCalledTimes(testEvents.length);
		});
	});

	describe('Raw Data Option', () => {
		test('should include raw data when includeRawData is true', async () => {
			mockTriggerFunctions.getNodeParameter = jest.fn((param: string) => {
				if (param === 'serverId') return 'test-server';
				if (param === 'events') return ['*'];
				if (param === 'options') {
					return {
						includeRawData: true,
						throttleEnabled: false,
					};
				}
				return undefined;
			});

			await triggerNode.trigger.call(mockTriggerFunctions);

			wsManagerInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;

			wsManagerInstance._triggerEvent('status', ['running']);

			const emittedData = mockEmit.mock.calls[0][0][0][0];
			expect(emittedData.json).toHaveProperty('raw');
			expect(emittedData.json.raw).toEqual({
				event: 'status',
				args: ['running'],
			});
		});

		test('should not include raw data when includeRawData is false', async () => {
			mockTriggerFunctions.getNodeParameter = jest.fn((param: string) => {
				if (param === 'serverId') return 'test-server';
				if (param === 'events') return ['*'];
				if (param === 'options') {
					return {
						includeRawData: false,
						throttleEnabled: false,
					};
				}
				return undefined;
			});

			await triggerNode.trigger.call(mockTriggerFunctions);

			wsManagerInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;

			wsManagerInstance._triggerEvent('status', ['running']);

			const emittedData = mockEmit.mock.calls[0][0][0][0];
			expect(emittedData.json).not.toHaveProperty('raw');
		});
	});

	describe('Multiple Events', () => {
		test('should emit multiple events in sequence', async () => {
			await triggerNode.trigger.call(mockTriggerFunctions);

			wsManagerInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;

			// Trigger multiple events
			wsManagerInstance._triggerEvent('status', ['starting']);
			wsManagerInstance._triggerEvent('console output', ['Server starting...']);
			wsManagerInstance._triggerEvent('status', ['running']);

			expect(mockEmit).toHaveBeenCalledTimes(3);

			// Verify event order
			expect(mockEmit.mock.calls[0][0][0][0].json.event).toBe('status');
			expect(mockEmit.mock.calls[0][0][0][0].json.data).toEqual(['starting']);

			expect(mockEmit.mock.calls[1][0][0][0].json.event).toBe('console output');
			expect(mockEmit.mock.calls[1][0][0][0].json.data).toEqual(['Server starting...']);

			expect(mockEmit.mock.calls[2][0][0][0].json.event).toBe('status');
			expect(mockEmit.mock.calls[2][0][0][0].json.data).toEqual(['running']);
		});
	});

	describe('Edge Cases', () => {
		test('should handle empty event data', async () => {
			await triggerNode.trigger.call(mockTriggerFunctions);

			wsManagerInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;

			wsManagerInstance._triggerEvent('console output', ['']);

			expect(mockEmit).toHaveBeenCalled();
			const emittedData = mockEmit.mock.calls[0][0][0][0];
			expect(emittedData.json.data).toEqual(['']);
		});

		test('should handle null event data', async () => {
			await triggerNode.trigger.call(mockTriggerFunctions);

			wsManagerInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;

			wsManagerInstance._triggerEvent('stats', [null]);

			expect(mockEmit).toHaveBeenCalled();
			const emittedData = mockEmit.mock.calls[0][0][0][0];
			expect(emittedData.json.data).toEqual([null]);
		});

		test('should handle complex stats data', async () => {
			await triggerNode.trigger.call(mockTriggerFunctions);

			wsManagerInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;

			const complexStats = {
				memory_bytes: 1073741824,
				memory_limit_bytes: 2147483648,
				cpu_absolute: 45.5,
				disk_bytes: 5368709120,
				network: {
					rx_bytes: 1048576,
					tx_bytes: 524288,
				},
				state: 'running',
			};

			wsManagerInstance._triggerEvent('stats', [complexStats]);

			expect(mockEmit).toHaveBeenCalled();
			const emittedData = mockEmit.mock.calls[0][0][0][0];
			expect(emittedData.json.data).toEqual([complexStats]);
		});

		test('should parse stats JSON string to object', async () => {
			await triggerNode.trigger.call(mockTriggerFunctions);

			wsManagerInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;

			// Simulate real Pterodactyl stats format (JSON string)
			const statsJson = JSON.stringify({
				memory_bytes: 536870912,
				memory_limit_bytes: 1073741824,
				cpu_absolute: 45.5,
				disk_bytes: 2147483648,
				network: {
					rx_bytes: 1048576,
					tx_bytes: 524288,
				},
				state: 'running',
			});

			wsManagerInstance._triggerEvent('stats', [statsJson]);

			expect(mockEmit).toHaveBeenCalled();
			const emittedData = mockEmit.mock.calls[0][0][0][0];

			// Should be parsed to object
			expect(typeof emittedData.json.data[0]).toBe('object');
			expect(emittedData.json.data[0]).toHaveProperty('memory_bytes');
			expect(emittedData.json.data[0].memory_bytes).toBe(536870912);
		});
	});
});
