/**
 * Unit tests for PterodactylWebsocket node - Server Control operations
 */

import { PterodactylWebsocket } from '../../../../nodes/PterodactylWebsocket/PterodactylWebsocket.node';
import { mockCredentials, tokenResponses } from '../../../fixtures';

// Mock the transport module
jest.mock('../../../../shared/transport', () => ({
	pterodactylApiRequest: jest.fn(),
}));

// Mock the WebSocket manager
let mockEventHandlers: Map<string, ((...args: any[]) => void)[]>;
let mockConnect: jest.Mock;
let mockSendCommand: jest.Mock;
let mockClose: jest.Mock;

jest.mock('../../../../shared/websocket/WebSocketManager', () => {
	return {
		PterodactylWebSocketManager: jest.fn().mockImplementation((_config, fetchToken) => {
			mockEventHandlers = new Map();

			return {
				connect: jest.fn(async () => {
					// Call fetchToken during connect (simulates real behavior)
					if (fetchToken) {
						await fetchToken();
					}
					// Then call the mockConnect to allow test verification
					if (mockConnect) {
						await mockConnect();
					}
				}),
				on: jest.fn((event: string, handler: (...args: any[]) => void) => {
					if (!mockEventHandlers.has(event)) {
						mockEventHandlers.set(event, []);
					}
					mockEventHandlers.get(event)!.push(handler);
				}),
				sendCommand: mockSendCommand,
				close: mockClose,
				_triggerEvent: (event: string, data: any) => {
					const handlers = mockEventHandlers.get(event);
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

describe('PterodactylWebsocket - Server Control', () => {
	let node: PterodactylWebsocket;
	let mockExecuteFunctions: any;

	beforeEach(() => {
		jest.clearAllMocks();
		mockEventHandlers = new Map();

		// Set up fresh mocks
		mockConnect = jest.fn(async () => {
			// Simulate successful connection
		});
		mockSendCommand = jest.fn();
		mockClose = jest.fn();

		(pterodactylApiRequest as jest.Mock).mockResolvedValue({
			data: tokenResponses.valid,
		});

		// Mock execute functions context
		mockExecuteFunctions = {
			getInputData: jest.fn(() => [{ json: {} }]),
			getNodeParameter: jest.fn((param: string, _index: number, defaultValue?: any) => {
				// Default parameters for server control
				if (param === 'resource') return 'serverControl';
				if (param === 'operation') return 'setState';
				if (param === 'serverId') return 'test-server-id';
				if (param === 'powerAction') return 'start';
				return defaultValue;
			}),
			getCredentials: jest.fn().mockResolvedValue(mockCredentials.valid),
			continueOnFail: jest.fn().mockReturnValue(false),
		};

		node = new PterodactylWebsocket();
	});

	describe('Node Definition', () => {
		test('should have correct node properties', () => {
			expect(node.description.displayName).toBe('Pterodactyl WebSocket');
			expect(node.description.name).toBe('pterodactylWebsocket');
			expect(node.description.group).toContain('transform');
			expect(node.description.version).toBe(1);
		});

		test('should require pterodactylClientApi credentials', () => {
			const credentials = node.description.credentials;
			expect(credentials).toBeDefined();
			expect(credentials![0].name).toBe('pterodactylClientApi');
			expect(credentials![0].required).toBe(true);
		});

		test('should have correct inputs and outputs', () => {
			expect(node.description.inputs).toEqual(['main']);
			expect(node.description.outputs).toEqual(['main']);
		});
	});

	describe('Set State Operation', () => {
		beforeEach(() => {
			mockExecuteFunctions.getNodeParameter = jest.fn((param: string) => {
				if (param === 'resource') return 'serverControl';
				if (param === 'operation') return 'setState';
				if (param === 'serverId') return 'test-server-id';
				if (param === 'powerAction') return 'start';
				return undefined;
			});
		});

		test('should execute set state operation successfully', async () => {
			// Simulate successful execution
			mockConnect.mockImplementation(async () => {
				// Connection successful
			});

			// Trigger status event after a delay
			setTimeout(() => {
				const wsInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;
				wsInstance._triggerEvent('status', ['running']);
			}, 10);

			const result = await node.execute.call(mockExecuteFunctions);

			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			expect(result[0][0].json).toEqual({
				success: true,
				serverId: 'test-server-id',
				action: 'start',
				status: 'running',
				timestamp: expect.any(String),
			});
		});

		test('should send set state command to WebSocket', async () => {
			// Trigger status event
			setTimeout(() => {
				const wsInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;
				wsInstance._triggerEvent('status', ['starting']);
			}, 10);

			await node.execute.call(mockExecuteFunctions);

			expect(mockSendCommand).toHaveBeenCalledWith({
				event: 'set state',
				args: ['start'],
			});
		});

		test('should handle different power actions', async () => {
			const actions = ['start', 'stop', 'restart', 'kill'];

			for (const action of actions) {
				jest.clearAllMocks();
				mockEventHandlers = new Map();

				mockExecuteFunctions.getNodeParameter = jest.fn((param: string) => {
					if (param === 'resource') return 'serverControl';
					if (param === 'operation') return 'setState';
					if (param === 'serverId') return 'test-server-id';
					if (param === 'powerAction') return action;
					return undefined;
				});

				setTimeout(() => {
					const wsInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;
					wsInstance._triggerEvent('status', ['offline']);
				}, 10);

				await node.execute.call(mockExecuteFunctions);

				expect(mockSendCommand).toHaveBeenCalledWith({
					event: 'set state',
					args: [action],
				});
			}
		});

		test('should close WebSocket connection after operation', async () => {
			setTimeout(() => {
				const wsInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;
				wsInstance._triggerEvent('status', ['running']);
			}, 10);

			await node.execute.call(mockExecuteFunctions);

			expect(mockClose).toHaveBeenCalled();
		});

		test('should handle status confirmation timeout', async () => {
			// Don't trigger any status event - let it timeout

			await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow(
				'Timeout waiting for status confirmation',
			);

			expect(mockClose).toHaveBeenCalled();
		}, 15000);

		test('should handle connection errors', async () => {
			mockConnect.mockRejectedValue(new Error('Connection failed'));

			await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow('Connection failed');
		});
	});

	describe('Send Command Operation', () => {
		beforeEach(() => {
			mockExecuteFunctions.getNodeParameter = jest.fn((param: string, _index, defaultValue) => {
				if (param === 'resource') return 'serverControl';
				if (param === 'operation') return 'sendCommand';
				if (param === 'serverId') return 'test-server-id';
				if (param === 'command') return 'say Hello World';
				if (param === 'waitForResponse') return false;
				if (param === 'responseTimeout') return 5000;
				return defaultValue;
			});
		});

		test('should execute send command without waiting for response', async () => {
			const result = await node.execute.call(mockExecuteFunctions);

			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			expect(result[0][0].json).toEqual({
				success: true,
				serverId: 'test-server-id',
				command: 'say Hello World',
				consoleOutput: [],
				timestamp: expect.any(String),
			});
		});

		test('should send command to WebSocket', async () => {
			await node.execute.call(mockExecuteFunctions);

			expect(mockSendCommand).toHaveBeenCalledWith({
				event: 'send command',
				args: ['say Hello World'],
			});
		});

		test('should wait for console output when requested', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn((param: string, _index, defaultValue) => {
				if (param === 'resource') return 'serverControl';
				if (param === 'operation') return 'sendCommand';
				if (param === 'serverId') return 'test-server-id';
				if (param === 'command') return 'say Hello World';
				if (param === 'waitForResponse') return true;
				if (param === 'responseTimeout') return 5000;
				return defaultValue;
			});

			// Simulate console output
			setTimeout(() => {
				const wsInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;
				wsInstance._triggerEvent('console output', ['[Server] Hello World']);
				wsInstance._triggerEvent('console output', ['[Server] Message received']);
			}, 50);

			const result = await node.execute.call(mockExecuteFunctions);

			expect(result[0][0].json.consoleOutput).toHaveLength(2);
			expect(result[0][0].json.consoleOutput).toContain('[Server] Hello World');
			expect(result[0][0].json.consoleOutput).toContain('[Server] Message received');
		});

		test('should respect response timeout', async () => {
			mockExecuteFunctions.getNodeParameter = jest.fn((param: string, _index, defaultValue) => {
				if (param === 'resource') return 'serverControl';
				if (param === 'operation') return 'sendCommand';
				if (param === 'serverId') return 'test-server-id';
				if (param === 'command') return 'say Test';
				if (param === 'waitForResponse') return true;
				if (param === 'responseTimeout') return 100;
				return defaultValue;
			});

			// Send output after timeout
			setTimeout(() => {
				const wsInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;
				wsInstance._triggerEvent('console output', ['Late message']);
			}, 200);

			const result = await node.execute.call(mockExecuteFunctions);

			// Should have empty output array due to timeout
			expect(result[0][0].json.consoleOutput).toEqual([]);
		});

		test('should close WebSocket connection after command', async () => {
			await node.execute.call(mockExecuteFunctions);

			expect(mockClose).toHaveBeenCalled();
		});
	});

	describe('Error Handling', () => {
		test('should handle missing credentials', async () => {
			mockExecuteFunctions.getCredentials = jest
				.fn()
				.mockRejectedValue(new Error('Credentials not found'));
			mockExecuteFunctions.getNodeParameter = jest.fn((param: string) => {
				if (param === 'resource') return 'serverControl';
				if (param === 'operation') return 'setState';
				return undefined;
			});

			await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow(
				'Credentials not found',
			);
		});

		test('should continue on fail when enabled', async () => {
			mockExecuteFunctions.continueOnFail = jest.fn().mockReturnValue(true);
			mockExecuteFunctions.getNodeParameter = jest.fn((param: string) => {
				if (param === 'resource') return 'serverControl';
				if (param === 'operation') return 'setState';
				if (param === 'serverId') return 'test-server-id';
				if (param === 'powerAction') return 'start';
				return undefined;
			});

			mockConnect.mockRejectedValue(new Error('Connection failed'));

			const result = await node.execute.call(mockExecuteFunctions);

			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			expect(result[0][0].json).toEqual({
				error: 'Connection failed',
				success: false,
			});
		});

		test('should handle token fetch errors', async () => {
			(pterodactylApiRequest as jest.Mock).mockRejectedValue(new Error('API error'));

			mockExecuteFunctions.getNodeParameter = jest.fn((param: string) => {
				if (param === 'resource') return 'serverControl';
				if (param === 'operation') return 'setState';
				return undefined;
			});

			await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow('API error');
		}, 15000);
	});

	describe('Multiple Items Processing', () => {
		test('should process multiple input items', async () => {
			mockExecuteFunctions.getInputData = jest.fn(() => [
				{ json: { item: 1 } },
				{ json: { item: 2 } },
			]);

			mockExecuteFunctions.getNodeParameter = jest.fn((param: string) => {
				if (param === 'resource') return 'serverControl';
				if (param === 'operation') return 'sendCommand';
				if (param === 'serverId') return 'test-server-id';
				if (param === 'command') return 'say Test';
				if (param === 'waitForResponse') return false;
				return undefined;
			});

			const result = await node.execute.call(mockExecuteFunctions);

			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(2);
			expect(result[0][0].json.success).toBe(true);
			expect(result[0][1].json.success).toBe(true);
		});
	});
});
