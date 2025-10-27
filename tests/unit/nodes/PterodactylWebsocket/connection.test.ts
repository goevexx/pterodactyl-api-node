/**
 * Unit tests for PterodactylWebsocket node - Connection operations
 */

import { PterodactylWebsocket } from '../../../../nodes/PterodactylWebsocket/PterodactylWebsocket.node';
import { mockCredentials, tokenResponses } from '../../../fixtures';

// Mock the transport module
jest.mock('../../../../shared/transport', () => ({
	pterodactylApiRequest: jest.fn(),
}));

// Mock the WebSocket manager
let mockConnect: jest.Mock;
let mockSendCommand: jest.Mock;
let mockClose: jest.Mock;
let mockIsConnected: jest.Mock;

jest.mock('../../../../shared/websocket/WebSocketManager', () => {
	return {
		PterodactylWebSocketManager: jest.fn().mockImplementation((_config, fetchToken) => {
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
				sendCommand: mockSendCommand,
				close: mockClose,
				isConnected: mockIsConnected,
			};
		}),
	};
});

import { pterodactylApiRequest } from '../../../../shared/transport';

describe('PterodactylWebsocket - Connection', () => {
	let node: PterodactylWebsocket;
	let mockExecuteFunctions: any;

	beforeEach(() => {
		jest.clearAllMocks();

		mockConnect = jest.fn(async () => {});
		mockSendCommand = jest.fn();
		mockClose = jest.fn();
		mockIsConnected = jest.fn().mockReturnValue(true);

		(pterodactylApiRequest as jest.Mock).mockResolvedValue({
			data: tokenResponses.valid,
		});

		mockExecuteFunctions = {
			getInputData: jest.fn(() => [{ json: {} }]),
			getNodeParameter: jest.fn((param: string, _index: number, defaultValue?: any) => {
				if (param === 'resource') return 'connection';
				if (param === 'serverId') return 'test-server-id';
				return defaultValue;
			}),
			getCredentials: jest.fn().mockResolvedValue(mockCredentials.valid),
			continueOnFail: jest.fn().mockReturnValue(false),
		};

		node = new PterodactylWebsocket();
	});

	describe('Test Connection Operation', () => {
		beforeEach(() => {
			mockExecuteFunctions.getNodeParameter = jest.fn(
				(param: string, _index: number, defaultValue?: any) => {
					if (param === 'resource') return 'connection';
					if (param === 'operation') return 'testConnection';
					if (param === 'serverId') return 'test-server-id';
					return defaultValue;
				},
			);
		});

		test('should test connection successfully', async () => {
			const result = await node.execute.call(mockExecuteFunctions);

			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			expect(result[0][0].json).toEqual({
				success: true,
				serverId: 'test-server-id',
				connected: true,
				connectionTime: expect.any(Number),
				timestamp: expect.any(String),
				message: 'WebSocket connection test successful',
			});
		});

		test('should measure connection time', async () => {
			// Add slight delay to connection
			mockConnect.mockImplementation(async () => {
				await new Promise((resolve) => setTimeout(resolve, 50));
			});

			const result = await node.execute.call(mockExecuteFunctions);

			const connectionTime = result[0][0].json.connectionTime as number;
			expect(connectionTime).toBeGreaterThan(0);
		});

		test('should call WebSocket manager connect', async () => {
			await node.execute.call(mockExecuteFunctions);

			expect(mockConnect).toHaveBeenCalled();
		});

		test('should check connection status', async () => {
			await node.execute.call(mockExecuteFunctions);

			expect(mockIsConnected).toHaveBeenCalled();
		});

		test('should close connection after test', async () => {
			await node.execute.call(mockExecuteFunctions);

			expect(mockClose).toHaveBeenCalled();
		});

		test('should handle connection failure gracefully', async () => {
			mockConnect.mockRejectedValue(new Error('Connection refused'));

			const result = await node.execute.call(mockExecuteFunctions);

			expect(result[0][0].json).toEqual({
				success: false,
				serverId: 'test-server-id',
				connected: false,
				error: 'Connection refused',
				timestamp: expect.any(String),
				message: 'WebSocket connection test failed',
			});

			expect(mockClose).toHaveBeenCalled();
		});

		test('should report disconnected status when isConnected returns false', async () => {
			mockIsConnected.mockReturnValue(false);

			const result = await node.execute.call(mockExecuteFunctions);

			expect(result[0][0].json.connected).toBe(false);
		});
	});

	describe('Send Auth Operation', () => {
		beforeEach(() => {
			mockExecuteFunctions.getNodeParameter = jest.fn(
				(param: string, _index: number, defaultValue?: any) => {
					if (param === 'resource') return 'connection';
					if (param === 'operation') return 'sendAuth';
					if (param === 'serverId') return 'test-server-id';
					return defaultValue;
				},
			);
		});

		test('should send re-authentication', async () => {
			const result = await node.execute.call(mockExecuteFunctions);

			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(1);
			expect(result[0][0].json).toEqual({
				success: true,
				serverId: 'test-server-id',
				message: 'Re-authentication successful',
				timestamp: expect.any(String),
			});
		});

		test('should fetch new token and send auth command', async () => {
			await node.execute.call(mockExecuteFunctions);

			// Should fetch token twice: once for connect, once for re-auth
			expect(pterodactylApiRequest).toHaveBeenCalledTimes(2);

			expect(mockSendCommand).toHaveBeenCalledWith({
				event: 'auth',
				args: [tokenResponses.valid.token],
			});
		});

		test('should connect before sending auth', async () => {
			await node.execute.call(mockExecuteFunctions);

			expect(mockConnect).toHaveBeenCalled();
		});

		test('should close connection after auth', async () => {
			await node.execute.call(mockExecuteFunctions);

			expect(mockClose).toHaveBeenCalled();
		});

		test('should handle auth errors gracefully', async () => {
			mockConnect.mockRejectedValue(new Error('Auth failed'));

			const result = await node.execute.call(mockExecuteFunctions);

			expect(result[0][0].json).toEqual({
				success: false,
				serverId: 'test-server-id',
				error: 'Auth failed',
				message: 'Re-authentication failed',
				timestamp: expect.any(String),
			});

			expect(mockClose).toHaveBeenCalled();
		});

		test('should handle token fetch errors', async () => {
			// First call succeeds (for connect), second fails (for re-auth)
			(pterodactylApiRequest as jest.Mock)
				.mockResolvedValueOnce({ data: tokenResponses.valid })
				.mockRejectedValueOnce(new Error('Token expired'));

			const result = await node.execute.call(mockExecuteFunctions);

			expect(result[0][0].json.success).toBe(false);
			expect(result[0][0].json.error).toContain('Token expired');
		});
	});

	describe('Error Handling', () => {
		test('should handle missing credentials', async () => {
			mockExecuteFunctions.getCredentials = jest
				.fn()
				.mockRejectedValue(new Error('Credentials not found'));
			mockExecuteFunctions.getNodeParameter = jest.fn(
				(param: string, _index: number, defaultValue?: any) => {
					if (param === 'resource') return 'connection';
					if (param === 'operation') return 'testConnection';
					return defaultValue;
				},
			);

			await expect(node.execute.call(mockExecuteFunctions)).rejects.toThrow(
				'Credentials not found',
			);
		});

		test('should continue on fail when enabled', async () => {
			mockExecuteFunctions.continueOnFail = jest.fn().mockReturnValue(true);
			mockConnect.mockRejectedValue(new Error('Connection failed'));

			mockExecuteFunctions.getNodeParameter = jest.fn(
				(param: string, _index: number, defaultValue?: any) => {
					if (param === 'resource') return 'connection';
					if (param === 'operation') return 'testConnection';
					return defaultValue;
				},
			);

			const result = await node.execute.call(mockExecuteFunctions);

			// Note: testConnection handles errors internally and returns error json,
			// so it won't trigger continueOnFail. This is expected behavior.
			expect(result[0][0].json.success).toBe(false);
		});
	});

	describe('Multiple Items Processing', () => {
		test('should process multiple input items', async () => {
			mockExecuteFunctions.getInputData = jest.fn(() => [
				{ json: { item: 1 } },
				{ json: { item: 2 } },
			]);

			mockExecuteFunctions.getNodeParameter = jest.fn(
				(param: string, index: number, defaultValue?: any) => {
					if (param === 'resource') return 'connection';
					if (param === 'operation') return 'testConnection';
					if (param === 'serverId') return `server-${index + 1}`;
					return defaultValue;
				},
			);

			const result = await node.execute.call(mockExecuteFunctions);

			expect(result).toHaveLength(1);
			expect(result[0]).toHaveLength(2);
			expect(result[0][0].json.serverId).toBe('server-1');
			expect(result[0][1].json.serverId).toBe('server-2');
		});
	});
});
