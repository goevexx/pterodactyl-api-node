import { getBackup } from '../../../../nodes/Pterodactyl/actions/backup/getBackup.operation';
import { createMockExecuteFunctions } from '../../../helpers/mockExecuteFunctions';
import * as PterodactylApiRequest from '../../../../nodes/Pterodactyl/transport/PterodactylApiRequest';

jest.mock('../../../../nodes/Pterodactyl/transport/PterodactylApiRequest');

describe('getBackup operation', () => {
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

			await expect(getBackup.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Get Backup operation requires Client API credentials. Please configure and select Client API credentials.',
			);
		});

		it('should proceed if Client API credentials are configured', async () => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('backup-uuid');
			mockPterodactylApiRequest.mockResolvedValue({});

			await getBackup.call(mockExecuteFunctions, 0);

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

			await getBackup.call(mockExecuteFunctions, 0);

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

			await getBackup.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'GET',
				'/servers/abc123/backups/backup-uuid-456',
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

			await getBackup.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[0]).toBe('GET');
		});

		it('should construct endpoint with serverId and backupId', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('xyz789')
				.mockReturnValueOnce('backup-123');

			await getBackup.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[1]).toBe('/servers/xyz789/backups/backup-123');
		});
	});

	describe('response handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
		});

		it('should return backup details', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('backup-uuid');

			const mockResponse = {
				object: 'backup',
				attributes: {
					uuid: 'backup-uuid',
					name: 'my-backup',
					bytes: 1024000,
					created_at: '2023-01-01T00:00:00+00:00',
					completed_at: '2023-01-01T00:05:00+00:00',
				},
			};

			mockPterodactylApiRequest.mockResolvedValue(mockResponse);

			const result = await getBackup.call(mockExecuteFunctions, 0);

			expect(result).toEqual(mockResponse);
		});

		it('should preserve all backup attributes', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('backup-uuid');

			const mockResponse = {
				attributes: {
					uuid: 'backup-uuid',
					is_successful: true,
					is_locked: false,
					checksum: 'sha256:abc123...',
				},
			};

			mockPterodactylApiRequest.mockResolvedValue(mockResponse);

			const result = await getBackup.call(mockExecuteFunctions, 0);

			expect(result).toEqual(mockResponse);
			expect(result.attributes.is_successful).toBe(true);
			expect(result.attributes.is_locked).toBe(false);
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

			await expect(getBackup.call(mockExecuteFunctions, 0)).rejects.toThrow('API request failed');
		});

		it('should handle backup not found errors', async () => {
			const notFoundError = new Error('Backup not found');
			(notFoundError as any).statusCode = 404;
			mockPterodactylApiRequest.mockRejectedValue(notFoundError);

			await expect(getBackup.call(mockExecuteFunctions, 0)).rejects.toThrow('Backup not found');
		});
	});
});
