import { createBackup } from '../../../../nodes/Pterodactyl/actions/backup/createBackup.operation';
import { createMockExecuteFunctions } from '../../../helpers/mockExecuteFunctions';
import * as PterodactylApiRequest from '../../../../nodes/Pterodactyl/transport/PterodactylApiRequest';

jest.mock('../../../../nodes/Pterodactyl/transport/PterodactylApiRequest');

describe('createBackup operation', () => {
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

			await expect(createBackup.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Create Backup operation requires Client API credentials. Please configure and select Client API credentials.',
			);
		});

		it('should proceed if Client API credentials are configured', async () => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter.mockReturnValue('abc123');
			mockPterodactylApiRequest.mockResolvedValue({});

			await createBackup.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 0);
		});
	});

	describe('parameter handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue({});
		});

		it('should get all required and optional parameters', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123') // serverId
				.mockReturnValueOnce('') // name
				.mockReturnValueOnce('') // ignored
				.mockReturnValueOnce(false); // isLocked

			await createBackup.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('serverId', 0);
			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('name', 0, '');
			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('ignored', 0, '');
			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('isLocked', 0);
		});
	});

	describe('API request - minimal configuration', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue({});
		});

		it('should send empty body when no optional parameters provided', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('')
				.mockReturnValueOnce('')
				.mockReturnValueOnce(false);

			await createBackup.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'POST',
				'/servers/abc123/backups',
				{},
				{},
				{},
				0,
			);
		});

		it('should construct endpoint with serverId', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('xyz789')
				.mockReturnValueOnce('')
				.mockReturnValueOnce('')
				.mockReturnValueOnce(false);

			await createBackup.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[1]).toBe('/servers/xyz789/backups');
		});
	});

	describe('API request - with optional parameters', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue({});
		});

		it('should include name in body when provided', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('my-backup')
				.mockReturnValueOnce('')
				.mockReturnValueOnce(false);

			await createBackup.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'POST',
				'/servers/abc123/backups',
				{ name: 'my-backup' },
				{},
				{},
				0,
			);
		});

		it('should include ignored patterns when provided', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('')
				.mockReturnValueOnce('*.log,cache/*')
				.mockReturnValueOnce(false);

			await createBackup.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[2]).toEqual({ ignored: '*.log,cache/*' });
		});

		it('should include is_locked when true', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('')
				.mockReturnValueOnce('')
				.mockReturnValueOnce(true);

			await createBackup.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[2]).toEqual({ is_locked: true });
		});

		it('should not include is_locked when false', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('')
				.mockReturnValueOnce('')
				.mockReturnValueOnce(false);

			await createBackup.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[2]).not.toHaveProperty('is_locked');
		});

		it('should include all optional parameters when provided', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('full-backup')
				.mockReturnValueOnce('*.log,temp/*')
				.mockReturnValueOnce(true);

			await createBackup.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'POST',
				'/servers/abc123/backups',
				{
					name: 'full-backup',
					ignored: '*.log,temp/*',
					is_locked: true,
				},
				{},
				{},
				0,
			);
		});
	});

	describe('response handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
		});

		it('should return API response', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('')
				.mockReturnValueOnce('')
				.mockReturnValueOnce(false);

			const mockResponse = {
				object: 'backup',
				attributes: {
					uuid: 'backup-uuid-123',
					name: 'my-backup',
					created_at: '2023-01-01T00:00:00+00:00',
				},
			};

			mockPterodactylApiRequest.mockResolvedValue(mockResponse);

			const result = await createBackup.call(mockExecuteFunctions, 0);

			expect(result).toEqual(mockResponse);
		});
	});

	describe('error handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('')
				.mockReturnValueOnce('')
				.mockReturnValueOnce(false);
		});

		it('should propagate API request errors', async () => {
			const error = new Error('API request failed');
			mockPterodactylApiRequest.mockRejectedValue(error);

			await expect(createBackup.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'API request failed',
			);
		});

		it('should handle server not found errors', async () => {
			const notFoundError = new Error('Server not found');
			(notFoundError as any).statusCode = 404;
			mockPterodactylApiRequest.mockRejectedValue(notFoundError);

			await expect(createBackup.call(mockExecuteFunctions, 0)).rejects.toThrow('Server not found');
		});

		it('should handle backup limit exceeded errors', async () => {
			const limitError = new Error('Backup limit exceeded');
			(limitError as any).statusCode = 422;
			mockPterodactylApiRequest.mockRejectedValue(limitError);

			await expect(createBackup.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Backup limit exceeded',
			);
		});
	});
});
