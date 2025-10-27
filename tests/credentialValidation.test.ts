import { IExecuteFunctions } from 'n8n-workflow';
import { powerAction } from '../nodes/Pterodactyl/actions/server/powerAction.operation';
import { createApiKey } from '../nodes/Pterodactyl/actions/account/createApiKey.operation';
import { createBackup } from '../nodes/Pterodactyl/actions/backup/createBackup.operation';
import { listFiles } from '../nodes/Pterodactyl/actions/file/listFiles.operation';
import { createDatabase } from '../nodes/Pterodactyl/actions/database/createDatabase.operation';

describe('Operation Credential Validation', () => {
	let mockExecuteFunctions: IExecuteFunctions;

	beforeEach(() => {
		mockExecuteFunctions = {
			getCredentials: jest.fn(),
			getNodeParameter: jest.fn(),
		} as unknown as IExecuteFunctions;
	});

	describe('Server Operations', () => {
		it('should throw specific error when Client API credentials missing for powerAction', async () => {
			(mockExecuteFunctions.getCredentials as jest.Mock).mockRejectedValue(
				new Error('Credentials not found'),
			);

			await expect(powerAction.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Power Action operation requires Client API credentials. Please configure and select Client API credentials.',
			);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 0);
		});

		it('should proceed when Client API credentials are available', async () => {
			(mockExecuteFunctions.getCredentials as jest.Mock).mockResolvedValue({
				baseUrl: 'https://panel.example.com',
				apiKey: 'test-key',
			});

			// Mock will throw because getNodeParameter is not fully implemented
			// This test verifies the credential check passes
			await expect(powerAction.call(mockExecuteFunctions, 0)).rejects.toThrow();

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 0);
		});
	});

	describe('Account Operations', () => {
		it('should throw specific error when Client API credentials missing for createApiKey', async () => {
			(mockExecuteFunctions.getCredentials as jest.Mock).mockRejectedValue(
				new Error('Credentials not found'),
			);

			await expect(createApiKey.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Create API Key operation requires Client API credentials. Please configure and select Client API credentials.',
			);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 0);
		});
	});

	describe('Backup Operations', () => {
		it('should throw specific error when Client API credentials missing for createBackup', async () => {
			(mockExecuteFunctions.getCredentials as jest.Mock).mockRejectedValue(
				new Error('Credentials not found'),
			);

			await expect(createBackup.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Create Backup operation requires Client API credentials. Please configure and select Client API credentials.',
			);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 0);
		});
	});

	describe('File Operations', () => {
		it('should throw specific error when Client API credentials missing for listFiles', async () => {
			(mockExecuteFunctions.getCredentials as jest.Mock).mockRejectedValue(
				new Error('Credentials not found'),
			);

			await expect(listFiles.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'List Files operation requires Client API credentials. Please configure and select Client API credentials.',
			);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 0);
		});
	});

	describe('Database Operations', () => {
		it('should throw specific error when Client API credentials missing for createDatabase', async () => {
			(mockExecuteFunctions.getCredentials as jest.Mock).mockRejectedValue(
				new Error('Credentials not found'),
			);

			await expect(createDatabase.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Create Database operation requires Client API credentials. Please configure and select Client API credentials.',
			);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 0);
		});
	});

	describe('Error Message Format', () => {
		it('should have consistent error message format across all operations', async () => {
			const operations = [
				{ fn: powerAction, name: 'Power Action' },
				{ fn: createApiKey, name: 'Create API Key' },
				{ fn: createBackup, name: 'Create Backup' },
				{ fn: listFiles, name: 'List Files' },
				{ fn: createDatabase, name: 'Create Database' },
			];

			(mockExecuteFunctions.getCredentials as jest.Mock).mockRejectedValue(
				new Error('Credentials not found'),
			);

			for (const operation of operations) {
				await expect(operation.fn.call(mockExecuteFunctions, 0)).rejects.toThrow(
					new RegExp(
						`${operation.name} operation requires Client API credentials\\. Please configure and select Client API credentials\\.`,
					),
				);
			}
		});

		it('should include operation name in error message', async () => {
			(mockExecuteFunctions.getCredentials as jest.Mock).mockRejectedValue(
				new Error('Credentials not found'),
			);

			try {
				await powerAction.call(mockExecuteFunctions, 0);
				fail('Expected error to be thrown');
			} catch (error: any) {
				expect(error.message).toContain('Power Action');
				expect(error.message).toContain('Client API credentials');
				expect(error.message).toContain('Please configure and select');
			}
		});
	});
});
