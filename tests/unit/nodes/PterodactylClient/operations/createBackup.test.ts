import { createBackup } from '../../../../../nodes/PterodactylClient/actions/backup/createBackup.operation';
import { createMockExecuteFunctions } from '../../../../helpers/mockExecuteFunctions';

describe('PterodactylClient - createBackup operation', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = createMockExecuteFunctions();
		mockExecuteFunctions.getCredentials.mockResolvedValue({
			panelUrl: 'https://panel.example.com',
			apiKey: 'ptlc_test_key',
		});
	});

	it('should create backup with name', async () => {
		const serverId = 'server123';
		const backupName = 'Daily Backup';

		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce(serverId) // serverId
			.mockReturnValueOnce(backupName) // name
			.mockReturnValueOnce('') // ignored
			.mockReturnValueOnce(false); // isLocked

		const mockBackupResponse = {
			attributes: {
				uuid: 'backup-uuid-123',
				name: backupName,
				is_successful: false,
				is_locked: false,
				bytes: 0,
			},
		};

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 201,
			body: mockBackupResponse,
		});

		const result = await createBackup.call(mockExecuteFunctions, 0);

		expect(result).toEqual(mockBackupResponse);
		expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('serverId', 0);
		expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('name', 0, '');
	});

	it('should use POST method to correct endpoint', async () => {
		const serverId = 'abc123';
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce(serverId)
			.mockReturnValueOnce('Test Backup')
			.mockReturnValueOnce('')
			.mockReturnValueOnce(false);

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 201,
			body: { attributes: {} },
		});

		await createBackup.call(mockExecuteFunctions, 0);

		const callArgs = mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0];
		expect(callArgs.method).toBe('POST');
		expect(callArgs.url).toContain(`/api/client/servers/${serverId}/backups`);
	});

	it('should include backup name in request body', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('server123')
			.mockReturnValueOnce('My Custom Backup')
			.mockReturnValueOnce('')
			.mockReturnValueOnce(false);

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 201,
			body: { attributes: {} },
		});

		await createBackup.call(mockExecuteFunctions, 0);

		const callArgs = mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0];
		expect(callArgs.body).toHaveProperty('name', 'My Custom Backup');
	});

	it('should handle backup limit exceeded error', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('server123')
			.mockReturnValueOnce('Backup')
			.mockReturnValueOnce('')
			.mockReturnValueOnce(false);

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 422,
			body: {
				errors: [
					{
						code: 'TooManyBackupsException',
						detail: 'Backup limit exceeded for this server',
					},
				],
			},
		});

		await expect(createBackup.call(mockExecuteFunctions, 0)).rejects.toThrow();
	});

	it('should use pterodactylClientApi credentials', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('server123')
			.mockReturnValueOnce('Backup')
			.mockReturnValueOnce('')
			.mockReturnValueOnce(false);

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 201,
			body: { attributes: {} },
		});

		await createBackup.call(mockExecuteFunctions, 0);

		expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 0);
	});

	it('should throw error when Client API credentials are missing', async () => {
		mockExecuteFunctions.getCredentials.mockRejectedValue(new Error('Credentials not found'));
		mockExecuteFunctions.getNodeParameter.mockReturnValue('server123');

		await expect(createBackup.call(mockExecuteFunctions, 0)).rejects.toThrow(
			'Create Backup operation requires Client API credentials',
		);
	});
});
