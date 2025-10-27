import { listApiKeys } from '../../../../nodes/Pterodactyl/actions/account/listApiKeys.operation';
import { createMockExecuteFunctions } from '../../../helpers/mockExecuteFunctions';
import * as PterodactylApiRequest from '../../../../nodes/Pterodactyl/transport/PterodactylApiRequest';

// Mock the transport module
jest.mock('../../../../nodes/Pterodactyl/transport/PterodactylApiRequest');

describe('listApiKeys operation', () => {
	let mockExecuteFunctions: any;
	const mockPterodactylApiRequest =
		PterodactylApiRequest.pterodactylApiRequest as jest.MockedFunction<
			typeof PterodactylApiRequest.pterodactylApiRequest
		>;

	beforeEach(() => {
		mockExecuteFunctions = createMockExecuteFunctions();
		jest.clearAllMocks();
	});

	describe('credential validation', () => {
		it('should throw error if Client API credentials are not configured', async () => {
			mockExecuteFunctions.getCredentials.mockRejectedValue(new Error('No credentials'));

			await expect(listApiKeys.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'List API Keys operation requires Client API credentials. Please configure and select Client API credentials.',
			);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 0);
		});

		it('should proceed if Client API credentials are configured', async () => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue({ data: [] });

			await listApiKeys.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 0);
		});
	});

	describe('API request', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
		});

		it('should call pterodactylApiRequest with correct parameters', async () => {
			mockPterodactylApiRequest.mockResolvedValue({ data: [] });

			await listApiKeys.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'GET',
				'/account/api-keys',
				{},
				{},
				{},
				0,
			);
		});

		it('should use GET method', async () => {
			mockPterodactylApiRequest.mockResolvedValue({ data: [] });

			await listApiKeys.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[0]).toBe('GET');
		});

		it('should request /account/api-keys endpoint', async () => {
			mockPterodactylApiRequest.mockResolvedValue({ data: [] });

			await listApiKeys.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[1]).toBe('/account/api-keys');
		});

		it('should pass empty body and query parameters', async () => {
			mockPterodactylApiRequest.mockResolvedValue({ data: [] });

			await listApiKeys.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[2]).toEqual({});
			expect(callArgs[3]).toEqual({});
			expect(callArgs[4]).toEqual({});
		});
	});

	describe('response transformation', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
		});

		it('should return data array from response', async () => {
			const mockApiKeys = [
				{
					object: 'api_key',
					attributes: {
						identifier: 'abc123',
						description: 'Test Key 1',
						created_at: '2023-01-01T00:00:00+00:00',
					},
				},
				{
					object: 'api_key',
					attributes: {
						identifier: 'def456',
						description: 'Test Key 2',
						created_at: '2023-01-02T00:00:00+00:00',
					},
				},
			];

			mockPterodactylApiRequest.mockResolvedValue({ data: mockApiKeys });

			const result = await listApiKeys.call(mockExecuteFunctions, 0);

			expect(result).toEqual(mockApiKeys);
		});

		it('should return empty array when response.data is undefined', async () => {
			mockPterodactylApiRequest.mockResolvedValue({});

			const result = await listApiKeys.call(mockExecuteFunctions, 0);

			expect(result).toEqual([]);
		});

		it('should return empty array when response.data is null', async () => {
			mockPterodactylApiRequest.mockResolvedValue({ data: null });

			const result = await listApiKeys.call(mockExecuteFunctions, 0);

			expect(result).toEqual([]);
		});

		it('should preserve empty data array', async () => {
			mockPterodactylApiRequest.mockResolvedValue({ data: [] });

			const result = await listApiKeys.call(mockExecuteFunctions, 0);

			expect(result).toEqual([]);
		});

		it('should handle single API key in response', async () => {
			const mockApiKey = [
				{
					object: 'api_key',
					attributes: {
						identifier: 'single123',
						description: 'Only Key',
					},
				},
			];

			mockPterodactylApiRequest.mockResolvedValue({ data: mockApiKey });

			const result = await listApiKeys.call(mockExecuteFunctions, 0);

			expect(result).toEqual(mockApiKey);
			expect(result.length).toBe(1);
		});

		it('should handle multiple API keys', async () => {
			const mockApiKeys = Array.from({ length: 5 }, (_, i) => ({
				object: 'api_key',
				attributes: {
					identifier: `key${i}`,
					description: `API Key ${i}`,
				},
			}));

			mockPterodactylApiRequest.mockResolvedValue({ data: mockApiKeys });

			const result = await listApiKeys.call(mockExecuteFunctions, 0);

			expect(result).toEqual(mockApiKeys);
			expect(result.length).toBe(5);
		});

		it('should preserve all attributes of API keys', async () => {
			const mockApiKeys = [
				{
					object: 'api_key',
					attributes: {
						identifier: 'full-key',
						description: 'Full API Key',
						allowed_ips: ['192.168.1.1', '10.0.0.0/8'],
						last_used_at: '2023-06-01T10:30:00+00:00',
						created_at: '2023-01-01T00:00:00+00:00',
					},
				},
			];

			mockPterodactylApiRequest.mockResolvedValue({ data: mockApiKeys });

			const result = await listApiKeys.call(mockExecuteFunctions, 0);

			expect(result[0].attributes).toHaveProperty('allowed_ips');
			expect(result[0].attributes).toHaveProperty('last_used_at');
			expect(result[0].attributes).toHaveProperty('created_at');
		});
	});

	describe('itemIndex parameter', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue({ data: [] });
		});

		it('should pass correct itemIndex to getCredentials', async () => {
			await listApiKeys.call(mockExecuteFunctions, 3);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 3);
		});

		it('should pass correct itemIndex to pterodactylApiRequest', async () => {
			await listApiKeys.call(mockExecuteFunctions, 5);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'GET',
				'/account/api-keys',
				{},
				{},
				{},
				5,
			);
		});

		it('should handle itemIndex 0', async () => {
			await listApiKeys.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'GET',
				'/account/api-keys',
				{},
				{},
				{},
				0,
			);
		});
	});

	describe('error handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
		});

		it('should propagate API request errors', async () => {
			const error = new Error('API request failed');
			mockPterodactylApiRequest.mockRejectedValue(error);

			await expect(listApiKeys.call(mockExecuteFunctions, 0)).rejects.toThrow('API request failed');
		});

		it('should handle authentication errors', async () => {
			const authError = new Error('Invalid API key');
			(authError as any).statusCode = 401;
			mockPterodactylApiRequest.mockRejectedValue(authError);

			await expect(listApiKeys.call(mockExecuteFunctions, 0)).rejects.toThrow('Invalid API key');
		});

		it('should handle permission errors', async () => {
			const permissionError = new Error('Insufficient permissions');
			(permissionError as any).statusCode = 403;
			mockPterodactylApiRequest.mockRejectedValue(permissionError);

			await expect(listApiKeys.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Insufficient permissions',
			);
		});

		it('should handle network errors', async () => {
			const networkError = new Error('Network timeout');
			(networkError as any).code = 'ETIMEDOUT';
			mockPterodactylApiRequest.mockRejectedValue(networkError);

			await expect(listApiKeys.call(mockExecuteFunctions, 0)).rejects.toThrow('Network timeout');
		});

		it('should handle server errors', async () => {
			const serverError = new Error('Internal server error');
			(serverError as any).statusCode = 500;
			mockPterodactylApiRequest.mockRejectedValue(serverError);

			await expect(listApiKeys.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Internal server error',
			);
		});
	});

	describe('no parameters required', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue({ data: [] });
		});

		it('should not call getNodeParameter', async () => {
			await listApiKeys.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getNodeParameter).not.toHaveBeenCalled();
		});

		it('should work without any user input', async () => {
			const mockApiKeys = [{ object: 'api_key', attributes: { identifier: 'test' } }];
			mockPterodactylApiRequest.mockResolvedValue({ data: mockApiKeys });

			const result = await listApiKeys.call(mockExecuteFunctions, 0);

			expect(result).toEqual(mockApiKeys);
			expect(mockExecuteFunctions.getNodeParameter).not.toHaveBeenCalled();
		});
	});
});
