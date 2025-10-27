import { deleteBackup } from '../../../../nodes/Pterodactyl/actions/backup/deleteBackup.operation';
import { createMockExecuteFunctions } from '../../../helpers/mockExecuteFunctions';
import * as PterodactylApiRequest from '../../../../nodes/Pterodactyl/transport/PterodactylApiRequest';

jest.mock('../../../../nodes/Pterodactyl/transport/PterodactylApiRequest');

describe('deleteBackup operation', () => {
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

			await expect(deleteBackup.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Delete Backup operation requires Client API credentials. Please configure and select Client API credentials.',
			);
		});

		it('should proceed if Client API credentials are configured', async () => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('backup-uuid');
			mockPterodactylApiRequest.mockResolvedValue(undefined);

			await deleteBackup.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 0);
		});
	});

	describe('parameter handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue(undefined);
		});

		it('should get serverId and backupId parameters', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('backup-uuid');

			await deleteBackup.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('serverId', 0);
			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('backupId', 0);
		});
	});

	describe('API request', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue(undefined);
		});

		it('should call pterodactylApiRequest with correct parameters', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('backup-uuid-456');

			await deleteBackup.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'DELETE',
				'/servers/abc123/backups/backup-uuid-456',
				{},
				{},
				{},
				0,
			);
		});

		it('should use DELETE method', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('backup-uuid');

			await deleteBackup.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[0]).toBe('DELETE');
		});

		it('should construct endpoint with serverId and backupId', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('xyz789')
				.mockReturnValueOnce('backup-123');

			await deleteBackup.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[1]).toBe('/servers/xyz789/backups/backup-123');
		});
	});

	describe('response handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue(undefined);
		});

		it('should return success response with backupId', async () => {
			const backupId = 'backup-uuid-789';
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce(backupId);

			const result = await deleteBackup.call(mockExecuteFunctions, 0);

			expect(result).toEqual({
				success: true,
				backupId: backupId,
			});
		});

		it('should include deleted backupId in response', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('my-backup-id');

			const result = await deleteBackup.call(mockExecuteFunctions, 0);

			expect(result.backupId).toBe('my-backup-id');
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

			await expect(deleteBackup.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'API request failed',
			);
		});

		it('should handle backup not found errors', async () => {
			const notFoundError = new Error('Backup not found');
			(notFoundError as any).statusCode = 404;
			mockPterodactylApiRequest.mockRejectedValue(notFoundError);

			await expect(deleteBackup.call(mockExecuteFunctions, 0)).rejects.toThrow('Backup not found');
		});

		it('should handle locked backup errors', async () => {
			const lockedError = new Error('Backup is locked');
			(lockedError as any).statusCode = 400;
			mockPterodactylApiRequest.mockRejectedValue(lockedError);

			await expect(deleteBackup.call(mockExecuteFunctions, 0)).rejects.toThrow('Backup is locked');
		});
	});
});
