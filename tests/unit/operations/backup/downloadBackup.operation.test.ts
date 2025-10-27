import { downloadBackup } from '../../../../nodes/Pterodactyl/actions/backup/downloadBackup.operation';
import { createMockExecuteFunctions } from '../../../helpers/mockExecuteFunctions';
import * as PterodactylApiRequest from '../../../../nodes/Pterodactyl/transport/PterodactylApiRequest';

jest.mock('../../../../nodes/Pterodactyl/transport/PterodactylApiRequest');

describe('downloadBackup operation', () => {
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

			await expect(downloadBackup.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Download Backup operation requires Client API credentials. Please configure and select Client API credentials.',
			);
		});

		it('should proceed if Client API credentials are configured', async () => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('backup-uuid');
			mockPterodactylApiRequest.mockResolvedValue({});

			await downloadBackup.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 0);
		});
	});

	describe('parameter handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue({});
		});

		it('should get serverId and backupId parameters', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('backup-uuid');

			await downloadBackup.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('serverId', 0);
			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('backupId', 0);
		});
	});

	describe('API request', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue({});
		});

		it('should call pterodactylApiRequest with correct parameters', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('backup-uuid-456');

			await downloadBackup.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'GET',
				'/servers/abc123/backups/backup-uuid-456/download',
				{},
				{},
				{},
				0,
			);
		});

		it('should use GET method', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('backup-uuid');

			await downloadBackup.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[0]).toBe('GET');
		});

		it('should construct download endpoint correctly', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('xyz789')
				.mockReturnValueOnce('backup-123');

			await downloadBackup.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[1]).toBe('/servers/xyz789/backups/backup-123/download');
		});
	});

	describe('response handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
		});

		it('should return download URL response', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('backup-uuid');

			const mockResponse = {
				object: 'signed_url',
				attributes: {
					url: 'https://example.com/download/backup-uuid?token=xyz',
				},
			};

			mockPterodactylApiRequest.mockResolvedValue(mockResponse);

			const result = await downloadBackup.call(mockExecuteFunctions, 0);

			expect(result).toEqual(mockResponse);
		});

		it('should preserve full download URL response', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('backup-uuid');

			const mockResponse = {
				attributes: {
					url: 'https://storage.example.com/signed-url',
					expires_at: '2023-01-01T01:00:00+00:00',
				},
			};

			mockPterodactylApiRequest.mockResolvedValue(mockResponse);

			const result = await downloadBackup.call(mockExecuteFunctions, 0);

			expect(result).toEqual(mockResponse);
			expect(result.attributes.url).toBeDefined();
		});
	});

	describe('error handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('backup-uuid');
		});

		it('should propagate API request errors', async () => {
			const error = new Error('API request failed');
			mockPterodactylApiRequest.mockRejectedValue(error);

			await expect(downloadBackup.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'API request failed',
			);
		});

		it('should handle backup not found errors', async () => {
			const notFoundError = new Error('Backup not found');
			(notFoundError as any).statusCode = 404;
			mockPterodactylApiRequest.mockRejectedValue(notFoundError);

			await expect(downloadBackup.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Backup not found',
			);
		});

		it('should handle backup not completed errors', async () => {
			const notReadyError = new Error('Backup not yet completed');
			(notReadyError as any).statusCode = 400;
			mockPterodactylApiRequest.mockRejectedValue(notReadyError);

			await expect(downloadBackup.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Backup not yet completed',
			);
		});
	});
});
