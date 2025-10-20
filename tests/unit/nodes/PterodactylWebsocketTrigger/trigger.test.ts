/**
 * Unit tests for PterodactylWebsocketTrigger node
 */

import { PterodactylWebsocketTrigger } from '../../../../nodes/PterodactylWebsocketTrigger/PterodactylWebsocketTrigger.trigger.node';
import { mockCredentials, mockNodeParameters, tokenResponses } from '../../../fixtures';

// Mock the transport module
jest.mock('../../../../shared/transport', () => ({
	pterodactylApiRequest: jest.fn(),
}));

// Mock the WebSocket manager
jest.mock('../../../../shared/websocket/WebSocketManager', () => {
	return {
		PterodactylWebSocketManager: jest.fn().mockImplementation((_config, fetchToken) => ({
			connect: jest.fn(async () => {
				// Call fetchToken to trigger the API request
				if (fetchToken) {
					await fetchToken();
				}
			}),
			on: jest.fn(),
			close: jest.fn(),
			sendCommand: jest.fn(),
		})),
	};
});

import { pterodactylApiRequest } from '../../../../shared/transport';
import { PterodactylWebSocketManager } from '../../../../shared/websocket/WebSocketManager';

describe('PterodactylWebsocketTrigger', () => {
	let triggerNode: PterodactylWebsocketTrigger;
	let mockTriggerFunctions: any;
	let mockEmit: jest.Mock;
	let mockHelpers: any;

	beforeEach(() => {
		jest.clearAllMocks();

		// Mock emit function
		mockEmit = jest.fn();

		// Mock helpers
		mockHelpers = {
			returnJsonArray: jest.fn((data) => data),
		};

		// Mock trigger functions context
		mockTriggerFunctions = {
			getNodeParameter: jest.fn((param: string) => {
				const params = mockNodeParameters.trigger;
				return (params as any)[param];
			}),
			getCredentials: jest.fn().mockResolvedValue(mockCredentials.valid),
			emit: mockEmit,
			helpers: mockHelpers,
		};

		// Mock pterodactylApiRequest to return valid token response
		(pterodactylApiRequest as jest.Mock).mockResolvedValue({
			data: tokenResponses.valid,
		});

		triggerNode = new PterodactylWebsocketTrigger();
	});

	describe('Node Definition', () => {
		test('should have correct node properties', () => {
			expect(triggerNode.description.displayName).toBe('Pterodactyl WebSocket Trigger');
			expect(triggerNode.description.name).toBe('pterodactylWebsocketTrigger');
			expect(triggerNode.description.group).toContain('trigger');
			expect(triggerNode.description.version).toBe(1);
		});

		test('should require pterodactylClientApi credentials', () => {
			const credentials = triggerNode.description.credentials;
			expect(credentials).toBeDefined();
			expect(credentials![0].name).toBe('pterodactylClientApi');
			expect(credentials![0].required).toBe(true);
		});

		test('should have correct inputs and outputs', () => {
			expect(triggerNode.description.inputs).toEqual([]);
			expect(triggerNode.description.outputs).toEqual(['main']);
		});

		test('should have serverId parameter', () => {
			const properties = triggerNode.description.properties;
			const serverIdParam = properties.find((p) => p.name === 'serverId');
			expect(serverIdParam).toBeDefined();
			expect(serverIdParam!.required).toBe(true);
			expect(serverIdParam!.type).toBe('string');
		});

		test('should have events parameter with multiOptions', () => {
			const properties = triggerNode.description.properties;
			const eventsParam = properties.find((p) => p.name === 'events');
			expect(eventsParam).toBeDefined();
			expect(eventsParam!.type).toBe('multiOptions');
			expect(eventsParam!.default).toEqual(['*']);
		});

		test('should have all event options defined', () => {
			const properties = triggerNode.description.properties;
			const eventsParam = properties.find((p) => p.name === 'events');
			const options = (eventsParam as any).options;

			expect(options).toContainEqual(
				expect.objectContaining({ name: 'All Events', value: '*' }),
			);
			expect(options).toContainEqual(
				expect.objectContaining({ name: 'Console Output', value: 'console output' }),
			);
			expect(options).toContainEqual(
				expect.objectContaining({ name: 'Status', value: 'status' }),
			);
			expect(options).toContainEqual(
				expect.objectContaining({ name: 'Stats', value: 'stats' }),
			);
		});
	});

	describe('Trigger Initialization', () => {
		test('should fetch WebSocket token on trigger', async () => {
			await triggerNode.trigger.call(mockTriggerFunctions);

			expect(pterodactylApiRequest).toHaveBeenCalledWith(
				'GET',
				'/api/client',
				'/servers/a1b2c3d4/websocket',
				{},
				{},
				{},
				0,
			);
		});

		test('should create WebSocket manager with correct config', async () => {
			await triggerNode.trigger.call(mockTriggerFunctions);

			expect(PterodactylWebSocketManager).toHaveBeenCalledWith(
				expect.objectContaining({
					serverId: 'a1b2c3d4',
					apiKey: mockCredentials.valid.apiKey,
					panelUrl: mockCredentials.valid.panelUrl,
					autoReconnect: true,
					maxReconnectAttempts: 5,
				}),
				expect.any(Function),
			);
		});

		test('should call connect on WebSocket manager', async () => {
			await triggerNode.trigger.call(mockTriggerFunctions);

			const wsManagerInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;
			expect(wsManagerInstance.connect).toHaveBeenCalled();
		});

		test('should return closeFunction and manualTriggerFunction', async () => {
			const result = await triggerNode.trigger.call(mockTriggerFunctions);

			expect(result).toHaveProperty('closeFunction');
			expect(result).toHaveProperty('manualTriggerFunction');
			expect(typeof result.closeFunction).toBe('function');
			expect(typeof result.manualTriggerFunction).toBe('function');
		});

		test('should handle token fetch errors', async () => {
			(pterodactylApiRequest as jest.Mock).mockRejectedValue(new Error('API error'));

			await expect(triggerNode.trigger.call(mockTriggerFunctions)).rejects.toThrow('API error');
		});

		test('should handle connection errors', async () => {
			// Reset the mock to simulate connection failure for this test only
			(PterodactylWebSocketManager as jest.Mock).mockImplementationOnce(() => ({
				connect: jest.fn().mockRejectedValue(new Error('Connection failed')),
				on: jest.fn(),
				close: jest.fn(),
			}));

			await expect(triggerNode.trigger.call(mockTriggerFunctions)).rejects.toThrow();
		});
	});

	describe('Manual Trigger Function', () => {
		test('should emit sample data when manual trigger called', async () => {
			const result = await triggerNode.trigger.call(mockTriggerFunctions);

			await result.manualTriggerFunction!();

			expect(mockEmit).toHaveBeenCalled();
			const emittedData = mockEmit.mock.calls[0][0][0][0];
			expect(emittedData).toHaveProperty('json');
			expect(emittedData.json).toHaveProperty('event');
			expect(emittedData.json).toHaveProperty('serverId');
			expect(emittedData.json).toHaveProperty('timestamp');
		});

		test('should emit status event in manual trigger', async () => {
			const result = await triggerNode.trigger.call(mockTriggerFunctions);

			await result.manualTriggerFunction!();

			const emittedData = mockEmit.mock.calls[0][0][0][0];
			expect(emittedData.json.event).toBe('status');
			expect(emittedData.json.data).toEqual(['running']);
		});
	});

	describe('Close Function', () => {
		test('should close WebSocket manager when closeFunction called', async () => {
			const result = await triggerNode.trigger.call(mockTriggerFunctions);
			const wsManagerInstance = (PterodactylWebSocketManager as jest.Mock).mock.results[0].value;

			await result.closeFunction!();

			expect(wsManagerInstance.close).toHaveBeenCalled();
		});

		test('should clear throttler when closeFunction called', async () => {
			// Set up trigger with throttling enabled
			mockTriggerFunctions.getNodeParameter = jest.fn((param: string) => {
				if (param === 'options') {
					return {
						throttleEnabled: true,
						throttleInterval: 100,
						throttleMaxBurst: 10,
					};
				}
				const params = mockNodeParameters.trigger;
				return (params as any)[param];
			});

			const result = await triggerNode.trigger.call(mockTriggerFunctions);

			// Close should not throw even with throttler
			await expect(result.closeFunction!()).resolves.not.toThrow();
		});
	});

	describe('Options Handling', () => {
		test('should use default options when not provided', async () => {
			mockTriggerFunctions.getNodeParameter = jest.fn((param: string) => {
				if (param === 'options') return {};
				const params = mockNodeParameters.trigger;
				return (params as any)[param];
			});

			await triggerNode.trigger.call(mockTriggerFunctions);

			expect(PterodactylWebSocketManager).toHaveBeenCalledWith(
				expect.objectContaining({
					autoReconnect: true,
					maxReconnectAttempts: 5,
				}),
				expect.any(Function),
			);
		});

		test('should respect custom reconnection settings', async () => {
			mockTriggerFunctions.getNodeParameter = jest.fn((param: string) => {
				if (param === 'options') {
					return {
						autoReconnect: false,
						maxReconnectAttempts: 3,
					};
				}
				const params = mockNodeParameters.trigger;
				return (params as any)[param];
			});

			await triggerNode.trigger.call(mockTriggerFunctions);

			expect(PterodactylWebSocketManager).toHaveBeenCalledWith(
				expect.objectContaining({
					autoReconnect: false,
					maxReconnectAttempts: 3,
				}),
				expect.any(Function),
			);
		});

		test('should create throttler when throttling enabled', async () => {
			mockTriggerFunctions.getNodeParameter = jest.fn((param: string) => {
				if (param === 'options') {
					return {
						throttleEnabled: true,
						throttleInterval: 200,
						throttleMaxBurst: 5,
						discardExcess: true,
					};
				}
				const params = mockNodeParameters.trigger;
				return (params as any)[param];
			});

			// Should not throw when creating trigger with throttling
			await expect(triggerNode.trigger.call(mockTriggerFunctions)).resolves.toBeDefined();
		});
	});

	describe('Credentials Handling', () => {
		test('should fetch credentials from trigger context', async () => {
			await triggerNode.trigger.call(mockTriggerFunctions);

			expect(mockTriggerFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi');
		});

		test('should use credentials in WebSocket manager', async () => {
			await triggerNode.trigger.call(mockTriggerFunctions);

			expect(PterodactylWebSocketManager).toHaveBeenCalledWith(
				expect.objectContaining({
					apiKey: mockCredentials.valid.apiKey,
					panelUrl: mockCredentials.valid.panelUrl,
				}),
				expect.any(Function),
			);
		});

		test('should handle missing credentials', async () => {
			mockTriggerFunctions.getCredentials = jest.fn().mockRejectedValue(
				new Error('Credentials not found'),
			);

			await expect(triggerNode.trigger.call(mockTriggerFunctions)).rejects.toThrow(
				'Credentials not found',
			);
		});
	});

	describe('Error Scenarios', () => {
		test('should handle invalid server ID', async () => {
			(pterodactylApiRequest as jest.Mock).mockRejectedValue(new Error('Server not found'));

			await expect(triggerNode.trigger.call(mockTriggerFunctions)).rejects.toThrow(
				'Server not found',
			);
		});

		test('should handle network errors during token fetch', async () => {
			(pterodactylApiRequest as jest.Mock).mockRejectedValue(new Error('Network error'));

			await expect(triggerNode.trigger.call(mockTriggerFunctions)).rejects.toThrow(
				'Network error',
			);
		});

		test('should handle WebSocket connection timeout', async () => {
			const mockConnect = jest.fn().mockRejectedValue(new Error('Connection timeout'));
			(PterodactylWebSocketManager as jest.Mock).mockImplementationOnce(() => ({
				connect: mockConnect,
				on: jest.fn(),
				close: jest.fn(),
			}));

			await expect(triggerNode.trigger.call(mockTriggerFunctions)).rejects.toThrow(
				'Connection timeout',
			);
		});
	});
});
