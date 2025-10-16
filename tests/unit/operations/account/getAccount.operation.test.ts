import { getAccount } from '../../../../nodes/Pterodactyl/actions/account/getAccount.operation';
import { createMockExecuteFunctions } from '../../../helpers/mockExecuteFunctions';
import * as PterodactylApiRequest from '../../../../nodes/Pterodactyl/transport/PterodactylApiRequest';

// Mock the transport module
jest.mock('../../../../nodes/Pterodactyl/transport/PterodactylApiRequest');

describe('getAccount operation', () => {
	let mockExecuteFunctions: any;
	const mockPterodactylApiRequest = PterodactylApiRequest.pterodactylApiRequest as jest.MockedFunction<typeof PterodactylApiRequest.pterodactylApiRequest>;

	beforeEach(() => {
		mockExecuteFunctions = createMockExecuteFunctions();
		jest.clearAllMocks();
	});

	describe('credential validation', () => {
		it('should throw error if Client API credentials are not configured', async () => {
			mockExecuteFunctions.getCredentials.mockRejectedValue(new Error('No credentials'));

			await expect(getAccount.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Get Account operation requires Client API credentials. Please configure and select Client API credentials.',
			);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 0);
		});

		it('should proceed if Client API credentials are configured', async () => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue({});

			await getAccount.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 0);
		});
	});

	describe('API request', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
		});

		it('should call pterodactylApiRequest with correct parameters', async () => {
			mockPterodactylApiRequest.mockResolvedValue({});

			await getAccount.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'GET',
				'/account',
				{},
				{},
				{},
				0,
			);
		});

		it('should use GET method', async () => {
			mockPterodactylApiRequest.mockResolvedValue({});

			await getAccount.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[0]).toBe('GET');
		});

		it('should request /account endpoint', async () => {
			mockPterodactylApiRequest.mockResolvedValue({});

			await getAccount.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[1]).toBe('/account');
		});

		it('should pass empty body and query parameters', async () => {
			mockPterodactylApiRequest.mockResolvedValue({});

			await getAccount.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[2]).toEqual({});
			expect(callArgs[3]).toEqual({});
			expect(callArgs[4]).toEqual({});
		});
	});

	describe('response handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
		});

		it('should return account information', async () => {
			const mockResponse = {
				object: 'user',
				attributes: {
					id: 1,
					admin: false,
					username: 'testuser',
					email: 'test@example.com',
					first_name: 'Test',
					last_name: 'User',
					language: 'en',
				},
			};

			mockPterodactylApiRequest.mockResolvedValue(mockResponse);

			const result = await getAccount.call(mockExecuteFunctions, 0);

			expect(result).toEqual(mockResponse);
		});

		it('should return full response with attributes', async () => {
			const mockResponse = {
				attributes: {
					id: 5,
					username: 'admin',
					email: 'admin@panel.com',
					admin: true,
				},
			};

			mockPterodactylApiRequest.mockResolvedValue(mockResponse);

			const result = await getAccount.call(mockExecuteFunctions, 0);

			expect(result).toEqual(mockResponse);
			expect(result.attributes).toBeDefined();
		});

		it('should handle minimal account response', async () => {
			const mockResponse = {
				attributes: {
					id: 1,
					username: 'user',
				},
			};

			mockPterodactylApiRequest.mockResolvedValue(mockResponse);

			const result = await getAccount.call(mockExecuteFunctions, 0);

			expect(result).toEqual(mockResponse);
		});

		it('should preserve all response fields', async () => {
			const mockResponse = {
				object: 'user',
				attributes: {
					id: 10,
					admin: true,
					username: 'poweruser',
					email: 'power@example.com',
					first_name: 'Power',
					last_name: 'User',
					language: 'es',
					created_at: '2023-01-01T00:00:00+00:00',
					updated_at: '2023-06-15T12:30:00+00:00',
				},
			};

			mockPterodactylApiRequest.mockResolvedValue(mockResponse);

			const result = await getAccount.call(mockExecuteFunctions, 0);

			expect(result).toEqual(mockResponse);
			expect(result.attributes.created_at).toBeDefined();
			expect(result.attributes.updated_at).toBeDefined();
		});
	});

	describe('itemIndex parameter', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue({});
		});

		it('should pass correct itemIndex to getCredentials', async () => {
			await getAccount.call(mockExecuteFunctions, 3);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 3);
		});

		it('should pass correct itemIndex to pterodactylApiRequest', async () => {
			await getAccount.call(mockExecuteFunctions, 7);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'GET',
				'/account',
				{},
				{},
				{},
				7,
			);
		});

		it('should handle itemIndex 0', async () => {
			await getAccount.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'GET',
				'/account',
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

			await expect(getAccount.call(mockExecuteFunctions, 0)).rejects.toThrow('API request failed');
		});

		it('should handle authentication errors', async () => {
			const authError = new Error('Invalid API key');
			(authError as any).statusCode = 401;
			mockPterodactylApiRequest.mockRejectedValue(authError);

			await expect(getAccount.call(mockExecuteFunctions, 0)).rejects.toThrow('Invalid API key');
		});

		it('should handle expired token errors', async () => {
			const tokenError = new Error('Token expired');
			(tokenError as any).statusCode = 401;
			mockPterodactylApiRequest.mockRejectedValue(tokenError);

			await expect(getAccount.call(mockExecuteFunctions, 0)).rejects.toThrow('Token expired');
		});

		it('should handle network errors', async () => {
			const networkError = new Error('Network error');
			(networkError as any).code = 'ECONNREFUSED';
			mockPterodactylApiRequest.mockRejectedValue(networkError);

			await expect(getAccount.call(mockExecuteFunctions, 0)).rejects.toThrow('Network error');
		});

		it('should handle server errors', async () => {
			const serverError = new Error('Internal server error');
			(serverError as any).statusCode = 500;
			mockPterodactylApiRequest.mockRejectedValue(serverError);

			await expect(getAccount.call(mockExecuteFunctions, 0)).rejects.toThrow('Internal server error');
		});
	});

	describe('no parameters required', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue({});
		});

		it('should not call getNodeParameter', async () => {
			await getAccount.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getNodeParameter).not.toHaveBeenCalled();
		});

		it('should work without any user input', async () => {
			const mockResponse = { attributes: { id: 1 } };
			mockPterodactylApiRequest.mockResolvedValue(mockResponse);

			const result = await getAccount.call(mockExecuteFunctions, 0);

			expect(result).toEqual(mockResponse);
			expect(mockExecuteFunctions.getNodeParameter).not.toHaveBeenCalled();
		});
	});
});
