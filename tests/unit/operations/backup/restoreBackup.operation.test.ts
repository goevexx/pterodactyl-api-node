import { restoreBackup } from '../../../../nodes/Pterodactyl/actions/backup/restoreBackup.operation';
import { createMockExecuteFunctions } from '../../../helpers/mockExecuteFunctions';
import * as PterodactylApiRequest from '../../../../nodes/Pterodactyl/transport/PterodactylApiRequest';

jest.mock('../../../../nodes/Pterodactyl/transport/PterodactylApiRequest');

describe('restoreBackup operation', () => {
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

			await expect(restoreBackup.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Restore Backup operation requires Client API credentials. Please configure and select Client API credentials.',
			);
		});

		it('should proceed if Client API credentials are configured', async () => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('backup-uuid')
				.mockReturnValueOnce(false);
			mockPterodactylApiRequest.mockResolvedValue(undefined);

			await restoreBackup.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 0);
		});
	});

	describe('parameter handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue(undefined);
		});

		it('should get all required parameters', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('backup-uuid')
				.mockReturnValueOnce(false);

			await restoreBackup.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('serverId', 0);
			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('backupId', 0);
			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('truncate', 0);
		});
	});

	describe('API request - truncate false', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue(undefined);
		});

		it('should send truncate:false in body', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('backup-uuid')
				.mockReturnValueOnce(false);

			await restoreBackup.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'POST',
				'/servers/abc123/backups/backup-uuid/restore',
				{ truncate: false },
				{},
				{},
				0,
			);
		});
	});

	describe('API request - truncate true', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue(undefined);
		});

		it('should send truncate:true in body', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('backup-uuid')
				.mockReturnValueOnce(true);

			await restoreBackup.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'POST',
				'/servers/abc123/backups/backup-uuid/restore',
				{ truncate: true },
				{},
				{},
				0,
			);
		});

		it('should use POST method', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('backup-uuid')
				.mockReturnValueOnce(true);

			await restoreBackup.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[0]).toBe('POST');
		});

		it('should construct restore endpoint correctly', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('xyz789')
				.mockReturnValueOnce('backup-123')
				.mockReturnValueOnce(false);

			await restoreBackup.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[1]).toBe('/servers/xyz789/backups/backup-123/restore');
		});
	});

	describe('response handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue(undefined);
		});

		it('should return success response with backupId and truncate', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('backup-uuid-789')
				.mockReturnValueOnce(false);

			const result = await restoreBackup.call(mockExecuteFunctions, 0);

			expect(result).toEqual({
				success: true,
				backupId: 'backup-uuid-789',
				truncate: false,
			});
		});

		it('should include truncate value in response', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('backup-uuid')
				.mockReturnValueOnce(true);

			const result = await restoreBackup.call(mockExecuteFunctions, 0);

			expect(result.truncate).toBe(true);
		});

		it('should include backupId in response', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('my-backup-id')
				.mockReturnValueOnce(false);

			const result = await restoreBackup.call(mockExecuteFunctions, 0);

			expect(result.backupId).toBe('my-backup-id');
		});
	});

	describe('error handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('backup-uuid')
				.mockReturnValueOnce(false);
		});

		it('should propagate API request errors', async () => {
			const error = new Error('API request failed');
			mockPterodactylApiRequest.mockRejectedValue(error);

			await expect(restoreBackup.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'API request failed',
			);
		});

		it('should handle backup not found errors', async () => {
			const notFoundError = new Error('Backup not found');
			(notFoundError as any).statusCode = 404;
			mockPterodactylApiRequest.mockRejectedValue(notFoundError);

			await expect(restoreBackup.call(mockExecuteFunctions, 0)).rejects.toThrow('Backup not found');
		});

		it('should handle backup not completed errors', async () => {
			const notReadyError = new Error('Backup not yet completed');
			(notReadyError as any).statusCode = 400;
			mockPterodactylApiRequest.mockRejectedValue(notReadyError);

			await expect(restoreBackup.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Backup not yet completed',
			);
		});

		it('should handle server running errors', async () => {
			const runningError = new Error('Server must be stopped');
			(runningError as any).statusCode = 409;
			mockPterodactylApiRequest.mockRejectedValue(runningError);

			await expect(restoreBackup.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Server must be stopped',
			);
		});
	});
});
