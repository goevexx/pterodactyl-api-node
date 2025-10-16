import { getUploadUrl } from '../../../../nodes/Pterodactyl/actions/file/getUploadUrl.operation';
import { createMockExecuteFunctions } from '../../../helpers/mockExecuteFunctions';
import * as PterodactylApiRequest from '../../../../nodes/Pterodactyl/transport/PterodactylApiRequest';

jest.mock('../../../../nodes/Pterodactyl/transport/PterodactylApiRequest');

describe('getUploadUrl operation', () => {
	let mockExecuteFunctions: any;
	const mockPterodactylApiRequest = PterodactylApiRequest.pterodactylApiRequest as jest.MockedFunction<typeof PterodactylApiRequest.pterodactylApiRequest>;

	beforeEach(() => {
		mockExecuteFunctions = createMockExecuteFunctions();
		jest.clearAllMocks();
	});

	describe('credential validation', () => {
		it('should throw error if Client API credentials are not configured', async () => {
			mockExecuteFunctions.getCredentials.mockRejectedValue(new Error('No credentials'));

			await expect(getUploadUrl.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Get Upload URL operation requires Client API credentials. Please configure and select Client API credentials.',
			);
		});

		it('should proceed if Client API credentials are configured', async () => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home');
			mockPterodactylApiRequest.mockResolvedValue({ attributes: { url: 'https://upload.url' } });

			await getUploadUrl.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 0);
		});
	});

	describe('parameter handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue({ attributes: { url: 'https://upload.url' } });
		});

		it('should get serverId and directory parameters', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home');

			await getUploadUrl.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('serverId', 0);
			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('directory', 0);
		});
	});

	describe('API request', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue({ attributes: { url: 'https://upload.url' } });
		});

		it('should call pterodactylApiRequest with correct parameters', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/uploads');

			await getUploadUrl.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'GET',
				'/servers/abc123/files/upload',
				{},
				{ directory: '/uploads' },
			);
		});

		it('should use GET method', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home');

			await getUploadUrl.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[0]).toBe('GET');
		});

		it('should pass directory as query parameter', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('xyz789')
				.mockReturnValueOnce('/var/www');

			await getUploadUrl.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[3]).toEqual({ directory: '/var/www' });
		});
	});

	describe('response handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home');
		});

		it('should return upload URL from response', async () => {
			const mockResponse = {
				object: 'signed_url',
				attributes: {
					url: 'https://example.com/upload?signature=abc123',
				},
			};

			mockPterodactylApiRequest.mockResolvedValue(mockResponse);

			const result = await getUploadUrl.call(mockExecuteFunctions, 0);

			expect(result).toEqual(mockResponse);
		});

		it('should preserve all response attributes', async () => {
			const mockResponse = {
				attributes: {
					url: 'https://example.com/upload?signature=xyz',
					expires_at: '2023-12-31T23:59:59+00:00',
				},
			};

			mockPterodactylApiRequest.mockResolvedValue(mockResponse);

			const result = await getUploadUrl.call(mockExecuteFunctions, 0);

			expect(result.attributes.url).toBeDefined();
			expect(result.attributes.expires_at).toBeDefined();
		});
	});

	describe('error handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home');
		});

		it('should propagate API request errors', async () => {
			const error = new Error('API request failed');
			mockPterodactylApiRequest.mockRejectedValue(error);

			await expect(getUploadUrl.call(mockExecuteFunctions, 0)).rejects.toThrow('API request failed');
		});

		it('should handle server not found errors', async () => {
			const notFoundError = new Error('Server not found');
			(notFoundError as any).statusCode = 404;
			mockPterodactylApiRequest.mockRejectedValue(notFoundError);

			await expect(getUploadUrl.call(mockExecuteFunctions, 0)).rejects.toThrow('Server not found');
		});

		it('should handle invalid directory errors', async () => {
			const validationError = new Error('Invalid directory path');
			(validationError as any).statusCode = 400;
			mockPterodactylApiRequest.mockRejectedValue(validationError);

			await expect(getUploadUrl.call(mockExecuteFunctions, 0)).rejects.toThrow('Invalid directory path');
		});
	});
});
