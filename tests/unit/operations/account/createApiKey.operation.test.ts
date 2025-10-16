import { createApiKey } from '../../../../nodes/Pterodactyl/actions/account/createApiKey.operation';
import { createMockExecuteFunctions } from '../../../helpers/mockExecuteFunctions';
import * as PterodactylApiRequest from '../../../../nodes/Pterodactyl/transport/PterodactylApiRequest';

// Mock the transport module
jest.mock('../../../../nodes/Pterodactyl/transport/PterodactylApiRequest');

describe('createApiKey operation', () => {
	let mockExecuteFunctions: any;
	const mockPterodactylApiRequest = PterodactylApiRequest.pterodactylApiRequest as jest.MockedFunction<typeof PterodactylApiRequest.pterodactylApiRequest>;

	beforeEach(() => {
		mockExecuteFunctions = createMockExecuteFunctions();
		jest.clearAllMocks();
	});

	describe('credential validation', () => {
		it('should throw error if Client API credentials are not configured', async () => {
			mockExecuteFunctions.getCredentials.mockRejectedValue(new Error('No credentials'));

			await expect(createApiKey.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Create API Key operation requires Client API credentials. Please configure and select Client API credentials.',
			);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 0);
		});

		it('should proceed if Client API credentials are configured', async () => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('Test API Key');
			mockPterodactylApiRequest.mockResolvedValue({ attributes: { identifier: 'abc123' } });

			await createApiKey.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 0);
		});
	});

	describe('parameter handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
		});

		it('should call getNodeParameter with description', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('My API Key');
			mockPterodactylApiRequest.mockResolvedValue({});

			await createApiKey.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('description', 0);
		});

		it('should call getNodeParameter with allowedIps', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('My API Key') // description
				.mockReturnValueOnce('192.168.1.1'); // allowedIps

			mockPterodactylApiRequest.mockResolvedValue({});

			await createApiKey.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('allowedIps', 0, '');
		});
	});

	describe('API request - without IP restrictions', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
		});

		it('should call pterodactylApiRequest with correct parameters when no IPs specified', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('Test API Key') // description
				.mockReturnValueOnce(''); // allowedIps (empty)

			mockPterodactylApiRequest.mockResolvedValue({ attributes: { identifier: 'abc123' } });

			await createApiKey.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'POST',
				'/account/api-keys',
				{ description: 'Test API Key' },
				{},
				{},
				0,
			);
		});

		it('should not include allowed_ips in body when empty string', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('My Key')
				.mockReturnValueOnce('');

			mockPterodactylApiRequest.mockResolvedValue({});

			await createApiKey.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[2]).toEqual({ description: 'My Key' });
			expect(callArgs[2]).not.toHaveProperty('allowed_ips');
		});
	});

	describe('API request - with IP restrictions', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
		});

		it('should parse single IP address correctly', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('Test API Key')
				.mockReturnValueOnce('192.168.1.1');

			mockPterodactylApiRequest.mockResolvedValue({});

			await createApiKey.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'POST',
				'/account/api-keys',
				{
					description: 'Test API Key',
					allowed_ips: ['192.168.1.1'],
				},
				{},
				{},
				0,
			);
		});

		it('should parse multiple comma-separated IPs correctly', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('Test API Key')
				.mockReturnValueOnce('192.168.1.1,10.0.0.1,172.16.0.1');

			mockPterodactylApiRequest.mockResolvedValue({});

			await createApiKey.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'POST',
				'/account/api-keys',
				{
					description: 'Test API Key',
					allowed_ips: ['192.168.1.1', '10.0.0.1', '172.16.0.1'],
				},
				{},
				{},
				0,
			);
		});

		it('should trim whitespace from IP addresses', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('Test API Key')
				.mockReturnValueOnce('  192.168.1.1  ,  10.0.0.1  ');

			mockPterodactylApiRequest.mockResolvedValue({});

			await createApiKey.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect((callArgs[2] as any).allowed_ips).toEqual(['192.168.1.1', '10.0.0.1']);
		});

		it('should handle CIDR notation', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('Test API Key')
				.mockReturnValueOnce('10.0.0.0/8,192.168.0.0/16');

			mockPterodactylApiRequest.mockResolvedValue({});

			await createApiKey.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect((callArgs[2] as any).allowed_ips).toEqual(['10.0.0.0/8', '192.168.0.0/16']);
		});
	});

	describe('response handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
		});

		it('should return the API response', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('Test API Key')
				.mockReturnValueOnce('');

			const mockResponse = {
				object: 'api_key',
				attributes: {
					identifier: 'abc123def456',
					description: 'Test API Key',
					token: 'ptlc_1234567890abcdef',
					created_at: '2023-01-01T00:00:00+00:00',
				},
			};

			mockPterodactylApiRequest.mockResolvedValue(mockResponse);

			const result = await createApiKey.call(mockExecuteFunctions, 0);

			expect(result).toEqual(mockResponse);
		});

		it('should pass through response with IP restrictions', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('Restricted Key')
				.mockReturnValueOnce('192.168.1.1');

			const mockResponse = {
				attributes: {
					identifier: 'xyz789',
					allowed_ips: ['192.168.1.1'],
				},
			};

			mockPterodactylApiRequest.mockResolvedValue(mockResponse);

			const result = await createApiKey.call(mockExecuteFunctions, 0);

			expect(result).toEqual(mockResponse);
		});
	});

	describe('itemIndex parameter', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
		});

		it('should pass correct itemIndex to API request', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('Test Key')
				.mockReturnValueOnce('');

			mockPterodactylApiRequest.mockResolvedValue({});

			await createApiKey.call(mockExecuteFunctions, 5);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'POST',
				'/account/api-keys',
				{ description: 'Test Key' },
				{},
				{},
				5,
			);
		});
	});

	describe('error handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
		});

		it('should propagate API request errors', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('Test Key')
				.mockReturnValueOnce('');

			const error = new Error('API request failed');
			mockPterodactylApiRequest.mockRejectedValue(error);

			await expect(createApiKey.call(mockExecuteFunctions, 0)).rejects.toThrow('API request failed');
		});

		it('should handle authentication errors', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('Test Key')
				.mockReturnValueOnce('');

			const authError = new Error('Invalid API key');
			(authError as any).statusCode = 401;
			mockPterodactylApiRequest.mockRejectedValue(authError);

			await expect(createApiKey.call(mockExecuteFunctions, 0)).rejects.toThrow('Invalid API key');
		});

		it('should handle validation errors', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('Test Key')
				.mockReturnValueOnce('invalid-ip-format');

			const validationError = new Error('Invalid IP address format');
			(validationError as any).statusCode = 422;
			mockPterodactylApiRequest.mockRejectedValue(validationError);

			await expect(createApiKey.call(mockExecuteFunctions, 0)).rejects.toThrow('Invalid IP address format');
		});
	});
});
