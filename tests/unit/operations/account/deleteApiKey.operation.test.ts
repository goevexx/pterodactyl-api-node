import { deleteApiKey } from '../../../../nodes/Pterodactyl/actions/account/deleteApiKey.operation';
import { createMockExecuteFunctions } from '../../../helpers/mockExecuteFunctions';
import * as PterodactylApiRequest from '../../../../nodes/Pterodactyl/transport/PterodactylApiRequest';

// Mock the transport module
jest.mock('../../../../nodes/Pterodactyl/transport/PterodactylApiRequest');

describe('deleteApiKey operation', () => {
	let mockExecuteFunctions: any;
	const mockPterodactylApiRequest = PterodactylApiRequest.pterodactylApiRequest as jest.MockedFunction<typeof PterodactylApiRequest.pterodactylApiRequest>;

	beforeEach(() => {
		mockExecuteFunctions = createMockExecuteFunctions();
		jest.clearAllMocks();
	});

	describe('credential validation', () => {
		it('should throw error if Client API credentials are not configured', async () => {
			mockExecuteFunctions.getCredentials.mockRejectedValue(new Error('No credentials'));

			await expect(deleteApiKey.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Delete API Key operation requires Client API credentials. Please configure and select Client API credentials.',
			);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 0);
		});

		it('should proceed if Client API credentials are configured', async () => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter.mockReturnValue('abc123');
			mockPterodactylApiRequest.mockResolvedValue(undefined);

			await deleteApiKey.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 0);
		});
	});

	describe('parameter handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue(undefined);
		});

		it('should call getNodeParameter with identifier', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('abc123def456');

			await deleteApiKey.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('identifier', 0);
		});

		it('should handle various identifier formats', async () => {
			const identifiers = ['abc123', 'long-identifier-12345', 'short'];

			for (const identifier of identifiers) {
				jest.clearAllMocks();
				mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
				mockExecuteFunctions.getNodeParameter.mockReturnValue(identifier);
				mockPterodactylApiRequest.mockResolvedValue(undefined);

				await deleteApiKey.call(mockExecuteFunctions, 0);

				expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
					'DELETE',
					`/account/api-keys/${identifier}`,
				);
			}
		});
	});

	describe('API request', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue(undefined);
		});

		it('should call pterodactylApiRequest with DELETE method', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('abc123');

			await deleteApiKey.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'DELETE',
				'/account/api-keys/abc123',
			);
		});

		it('should construct correct endpoint URL with identifier', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('test-identifier-789');

			await deleteApiKey.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[0]).toBe('DELETE');
			expect(callArgs[1]).toBe('/account/api-keys/test-identifier-789');
		});

		it('should make DELETE request without body', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('abc123');

			await deleteApiKey.call(mockExecuteFunctions, 0);

			// Verify no body is passed (DELETE requests typically don't have body)
			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'DELETE',
				'/account/api-keys/abc123',
			);
			expect(mockPterodactylApiRequest.mock.calls[0].length).toBe(2);
		});
	});

	describe('response handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue(undefined);
		});

		it('should return success response with identifier', async () => {
			const identifier = 'abc123def456';
			mockExecuteFunctions.getNodeParameter.mockReturnValue(identifier);

			const result = await deleteApiKey.call(mockExecuteFunctions, 0);

			expect(result).toEqual({
				success: true,
				identifier: identifier,
			});
		});

		it('should return consistent response structure', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('test-id');

			const result = await deleteApiKey.call(mockExecuteFunctions, 0);

			expect(result).toHaveProperty('success');
			expect(result).toHaveProperty('identifier');
			expect(result.success).toBe(true);
			expect(result.identifier).toBe('test-id');
		});

		it('should include deleted identifier in response', async () => {
			const testIdentifiers = ['id1', 'id2', 'very-long-identifier-12345'];

			for (const id of testIdentifiers) {
				jest.clearAllMocks();
				mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
				mockExecuteFunctions.getNodeParameter.mockReturnValue(id);
				mockPterodactylApiRequest.mockResolvedValue(undefined);

				const result = await deleteApiKey.call(mockExecuteFunctions, 0);

				expect(result.identifier).toBe(id);
			}
		});
	});

	describe('itemIndex parameter', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue(undefined);
		});

		it('should use correct itemIndex for getCredentials', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('abc123');

			await deleteApiKey.call(mockExecuteFunctions, 3);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 3);
		});

		it('should use correct itemIndex for getNodeParameter', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('abc123');

			await deleteApiKey.call(mockExecuteFunctions, 7);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('identifier', 7);
		});
	});

	describe('error handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
		});

		it('should propagate API request errors', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('abc123');

			const error = new Error('API request failed');
			mockPterodactylApiRequest.mockRejectedValue(error);

			await expect(deleteApiKey.call(mockExecuteFunctions, 0)).rejects.toThrow('API request failed');
		});

		it('should handle authentication errors', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('abc123');

			const authError = new Error('Invalid API key');
			(authError as any).statusCode = 401;
			mockPterodactylApiRequest.mockRejectedValue(authError);

			await expect(deleteApiKey.call(mockExecuteFunctions, 0)).rejects.toThrow('Invalid API key');
		});

		it('should handle not found errors', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('nonexistent-id');

			const notFoundError = new Error('API key not found');
			(notFoundError as any).statusCode = 404;
			mockPterodactylApiRequest.mockRejectedValue(notFoundError);

			await expect(deleteApiKey.call(mockExecuteFunctions, 0)).rejects.toThrow('API key not found');
		});

		it('should handle permission errors', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('abc123');

			const permissionError = new Error('Insufficient permissions');
			(permissionError as any).statusCode = 403;
			mockPterodactylApiRequest.mockRejectedValue(permissionError);

			await expect(deleteApiKey.call(mockExecuteFunctions, 0)).rejects.toThrow('Insufficient permissions');
		});
	});
});
