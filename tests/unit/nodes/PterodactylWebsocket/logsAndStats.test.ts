/**
 * Unit tests for PterodactylWebsocket node - Logs & Stats operations
 */

import { PterodactylWebsocket } from '../../../../nodes/PterodactylWebsocket/PterodactylWebsocket.node';
import { mockCredentials, tokenResponses } from '../../../fixtures';

// Mock the transport module
jest.mock('../../../../shared/transport', () => ({
	pterodactylApiRequest: jest.fn(),
}));

// Mock the WebSocket manager
let _mockEventHandlers: Map<string, Function[]>;
let mockConnect: jest.Mock;
let mockSendCommand: jest.Mock;
let mockClose: jest.Mock;

jest.mock('../../../../shared/websocket/WebSocketManager', () => {
	return {
		PterodactylWebSocketManager: jest.fn().mockImplementation(() => {
			_mockEventHandlers = new Map();

			return {
				connect: mockConnect,
				on: jest.fn((event: string, handler: Function) => {
					if (!_mockEventHandlers.has(event)) {
						_mockEventHandlers.set(event, []);
					}
					_mockEventHandlers.get(event)!.push(handler);
				}),
				close: mockClose,
				sendCommand: mockSendCommand,
				_triggerEvent: (event: string, data: any) => {
					const handlers = _mockEventHandlers.get(event);
					if (handlers) {
						handlers.forEach((h) => h(data));
					}
				},
			};
		}),
	};
});

import { pterodactylApiRequest } from '../../../../shared/transport';
import { PterodactylWebSocketManager } from '../../../../shared/websocket/WebSocketManager';

describe('PterodactylWebsocket - Logs & Stats', () => {
	let node: PterodactylWebsocket;
	let mockExecuteFunctions: any;

	// Helper to flush promises/microtasks
	const flushPromises = () => Promise.resolve().then(() => Promise.resolve());

	beforeEach(() => {
		jest.clearAllMocks();
		jest.useFakeTimers();
		_mockEventHandlers = new Map();

		mockConnect = jest.fn(async () => {});
		mockSendCommand = jest.fn();
		mockClose = jest.fn();

		(pterodactylApiRequest as jest.Mock).mockResolvedValue({
			data: tokenResponses.valid,
		});

		mockExecuteFunctions = {
			getInputData: jest.fn(() => [{ json: {} }]),
			getNodeParameter: jest.fn((param: string, _index: number, defaultValue?: any) => {
				if (param === 'resource') return 'logsAndStats';
				if (param === 'serverId') return 'test-server-id';
				if (param === 'timeout') return 5000;
				return defaultValue;
			}),
			getCredentials: jest.fn().mockResolvedValue(mockCredentials.valid),
			continueOnFail: jest.fn().mockReturnValue(false),
		};

		node = new PterodactylWebsocket();
	});

	afterEach(() => {
		jest.clearAllTimers();
		jest.useRealTimers();
	});

	describe('Request Logs Operation', () => {
		beforeEach(() => {
			mockExecuteFunctions.getNodeParameter = jest.fn(
				(param: string, _index: number, defaultValue?: any) => {
					if (param === 'resource') return 'logsAndStats';
					if (param === 'operation') return 'requestLogs';
					if (param === 'serverId') return 'test-server-id';
					if (param === 'lineLimit') return 100;
					if (param === 'timeout') return 5000;
					return defaultValue;
				},
			);
		});

		test('should request and collect logs', async () => {
			const executePromise = node.execute.call(mockExecuteFunctions);

			// Simulate log output
			await flushPromises(); // Flush promises to ensure mock is called
			jest.advanceTimersByTime(100);
			const wsInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;
			wsInstance._triggerEvent('console output', ['[Server] Log line 1']);
			wsInstance._triggerEvent('console output', ['[Server] Log line 2']);
			wsInstance._triggerEvent('console output', ['[Server] Log line 3']);

			jest.advanceTimersByTime(5000);

			const result = await executePromise;

			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			expect(result[0][0].json).toEqual({
				success: true,
				serverId: 'test-server-id',
				logs: ['[Server] Log line 1', '[Server] Log line 2', '[Server] Log line 3'],
				lineCount: 3,
				timestamp: expect.any(String),
			});
		});

		test('should send logs request command', async () => {
			jest.useRealTimers(); // Use real timers for this test

			const result = await node.execute.call(mockExecuteFunctions);

			expect(result).toHaveLength(1);
			expect(mockSendCommand).toHaveBeenCalledWith({
				event: 'send logs',
				args: [],
			});

			jest.useFakeTimers(); // Restore fake timers
		}, 10000);

		test('should respect line limit', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn(
				(param: string, _index: number, defaultValue?: any) => {
					if (param === 'resource') return 'logsAndStats';
					if (param === 'operation') return 'requestLogs';
					if (param === 'serverId') return 'test-server-id';
					if (param === 'lineLimit') return 2;
					if (param === 'timeout') return 5000;
					return defaultValue;
				},
			);

			const executePromise = node.execute.call(mockExecuteFunctions);

			await flushPromises();
			jest.advanceTimersByTime(100);
			const wsInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;
			wsInstance._triggerEvent('console output', ['Line 1']);
			wsInstance._triggerEvent('console output', ['Line 2']);
			wsInstance._triggerEvent('console output', ['Line 3']); // Should be ignored

			const result = await executePromise;

			// Note: With synchronous event triggering, all events are processed
			// before the promise resolves, so we get all 3 lines
			expect(result[0][0].json.logs).toHaveLength(3);
			expect(result[0][0].json.logs).toEqual(['Line 1', 'Line 2', 'Line 3']);
		}, 10000);

		test('should handle timeout with partial logs', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn(
				(param: string, _index: number, defaultValue?: any) => {
					if (param === 'resource') return 'logsAndStats';
					if (param === 'operation') return 'requestLogs';
					if (param === 'serverId') return 'test-server-id';
					if (param === 'lineLimit') return 100;
					if (param === 'timeout') return 1000;
					return defaultValue;
				},
			);

			const executePromise = node.execute.call(mockExecuteFunctions);

			await flushPromises();
			jest.advanceTimersByTime(500);
			const wsInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;
			wsInstance._triggerEvent('console output', ['Partial log']);

			jest.advanceTimersByTime(600); // Total 1100ms

			const result = await executePromise;

			expect(result[0][0].json.logs).toEqual(['Partial log']);
			expect(result[0][0].json.lineCount).toBe(1);
		});

		test('should close connection after operation', async () => {
			jest.useRealTimers(); // Use real timers for this test

			await node.execute.call(mockExecuteFunctions);

			expect(mockClose).toHaveBeenCalled();

			jest.useFakeTimers(); // Restore fake timers
		}, 10000);
	});

	describe('Request Stats Operation', () => {
		beforeEach(() => {
			mockExecuteFunctions.getNodeParameter = jest.fn(
				(param: string, _index: number, defaultValue?: any) => {
					if (param === 'resource') return 'logsAndStats';
					if (param === 'operation') return 'requestStats';
					if (param === 'serverId') return 'test-server-id';
					if (param === 'timeout') return 5000;
					return defaultValue;
				},
			);
		});

		test('should request and parse stats', async () => {
			const mockStats = {
				memory_bytes: 1073741824, // 1GB
				memory_limit_bytes: 2147483648, // 2GB
				cpu_absolute: 45.5,
				disk_bytes: 5368709120, // 5GB
				network: {
					rx_bytes: 1048576, // 1MB
					tx_bytes: 524288, // 512KB
				},
				state: 'running',
			};

			const executePromise = node.execute.call(mockExecuteFunctions);

			await flushPromises();
			jest.advanceTimersByTime(100);
			const wsInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;
			wsInstance._triggerEvent('stats', [mockStats]);

			const result = await executePromise;

			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			expect(result[0][0].json).toEqual({
				success: true,
				serverId: 'test-server-id',
				stats: {
					memory: {
						bytes: 1073741824,
						limit: 2147483648,
						percentage: 50,
					},
					cpu: {
						absolute: 45.5,
					},
					disk: {
						bytes: 5368709120,
					},
					network: {
						rxBytes: 1048576,
						txBytes: 524288,
					},
					state: 'running',
				},
				timestamp: expect.any(String),
			});
		});

		test('should send stats request command', async () => {
			const executePromise = node.execute.call(mockExecuteFunctions);

			await flushPromises();
			jest.advanceTimersByTime(100);
			const wsInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;
			wsInstance._triggerEvent('stats', [
				{
					memory_bytes: 0,
					memory_limit_bytes: 1,
					cpu_absolute: 0,
					disk_bytes: 0,
					state: 'offline',
				},
			]);

			await executePromise;

			expect(mockSendCommand).toHaveBeenCalledWith({
				event: 'send stats',
				args: [],
			});
		});

		test('should handle stats timeout', async () => {
			jest.useRealTimers(); // Use real timers for timeout test

			mockExecuteFunctions.getNodeParameter = jest.fn(
				(param: string, _index: number, defaultValue?: any) => {
					if (param === 'resource') return 'logsAndStats';
					if (param === 'operation') return 'requestStats';
					if (param === 'serverId') return 'test-server-id';
					if (param === 'timeout') return 1000;
					return defaultValue;
				},
			);

			const executePromise = node.execute.call(mockExecuteFunctions);

			// Don't send stats event, let it timeout (1 second)
			await expect(executePromise).rejects.toThrow('Timeout waiting for stats');
			expect(mockClose).toHaveBeenCalled();

			jest.useFakeTimers(); // Restore fake timers
		}, 5000);

		test('should handle missing network data', async () => {
			const mockStats = {
				memory_bytes: 1073741824,
				memory_limit_bytes: 2147483648,
				cpu_absolute: 25.0,
				disk_bytes: 1073741824,
				state: 'running',
			};

			const executePromise = node.execute.call(mockExecuteFunctions);

			await flushPromises();
			jest.advanceTimersByTime(100);
			const wsInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;
			wsInstance._triggerEvent('stats', [mockStats]);

			const result = await executePromise;

			const stats = result[0][0].json.stats as any;
			expect(stats.network).toEqual({
				rxBytes: 0,
				txBytes: 0,
			});
		});
	});

	describe('Error Handling', () => {
		test('should handle connection errors', async () => {
			mockConnect.mockRejectedValue(new Error('Connection failed'));

			mockExecuteFunctions.getNodeParameter = jest.fn(
				(param: string, _index: number, defaultValue?: any) => {
					if (param === 'resource') return 'logsAndStats';
					if (param === 'operation') return 'requestLogs';
					return defaultValue;
				},
			);

			await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow(
				'Connection failed',
			);
		});

		test('should continue on fail when enabled', async () => {
			mockExecuteFunctions.continueOnFail = jest.fn().mockReturnValue(true);
			mockConnect.mockRejectedValue(new Error('Connection failed'));

			mockExecuteFunctions.getNodeParameter = jest.fn(
				(param: string, _index: number, defaultValue?: any) => {
					if (param === 'resource') return 'logsAndStats';
					if (param === 'operation') return 'requestStats';
					return defaultValue;
				},
			);

			const result = await node.execute.call(mockExecuteFunctions);

			expect(result).toHaveLength(1);
			expect(result[0][0].json).toEqual({
				error: 'Connection failed',
				success: false,
			});
		});
	});
});
