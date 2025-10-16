import { decompressFile } from '../../../../nodes/Pterodactyl/actions/file/decompressFile.operation';
import { createMockExecuteFunctions } from '../../../helpers/mockExecuteFunctions';
import * as PterodactylApiRequest from '../../../../nodes/Pterodactyl/transport/PterodactylApiRequest';

jest.mock('../../../../nodes/Pterodactyl/transport/PterodactylApiRequest');

describe('decompressFile operation', () => {
	let mockExecuteFunctions: any;
	const mockPterodactylApiRequest = PterodactylApiRequest.pterodactylApiRequest as jest.MockedFunction<typeof PterodactylApiRequest.pterodactylApiRequest>;

	beforeEach(() => {
		mockExecuteFunctions = createMockExecuteFunctions();
		jest.clearAllMocks();
	});

	describe('credential validation', () => {
		it('should throw error if Client API credentials are not configured', async () => {
			mockExecuteFunctions.getCredentials.mockRejectedValue(new Error('No credentials'));

			await expect(decompressFile.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Decompress File operation requires Client API credentials. Please configure and select Client API credentials.',
			);
		});

		it('should proceed if Client API credentials are configured', async () => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home')
				.mockReturnValueOnce('archive.tar.gz');
			mockPterodactylApiRequest.mockResolvedValue(undefined);

			await decompressFile.call(mockExecuteFunctions, 0);

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
				.mockReturnValueOnce('/backups')
				.mockReturnValueOnce('backup.zip');

			await decompressFile.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('serverId', 0);
			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('root', 0);
			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('file', 0);
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
				.mockReturnValueOnce('/var/www')
				.mockReturnValueOnce('website.tar.gz');

			await decompressFile.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'POST',
				'/servers/abc123/files/decompress',
				{
					root: '/var/www',
					file: 'website.tar.gz',
				},
				{},
				{},
				0,
			);
		});

		it('should use POST method', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home')
				.mockReturnValueOnce('archive.zip');

			await decompressFile.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[0]).toBe('POST');
		});

		it('should include root and file in request body', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('xyz789')
				.mockReturnValueOnce('/data')
				.mockReturnValueOnce('export.tar.gz');

			await decompressFile.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect((callArgs[2] as any).root).toBe('/data');
			expect((callArgs[2] as any).file).toBe('export.tar.gz');
		});

		it('should handle different archive formats', async () => {
			const formats = ['archive.zip', 'backup.tar.gz', 'files.tar'];

			for (const format of formats) {
				jest.clearAllMocks();
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('abc123')
					.mockReturnValueOnce('/tmp')
					.mockReturnValueOnce(format);

				await decompressFile.call(mockExecuteFunctions, 0);

				const callArgs = mockPterodactylApiRequest.mock.calls[0];
				expect((callArgs[2] as any).file).toBe(format);
			}
		});
	});

	describe('response handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue(undefined);
		});

		it('should return success response', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home')
				.mockReturnValueOnce('archive.zip');

			const result = await decompressFile.call(mockExecuteFunctions, 0);

			expect(result).toEqual({
				success: true,
				file: 'archive.zip',
			});
		});

		it('should include decompressed file name in response', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/var/www')
				.mockReturnValueOnce('website.tar.gz');

			const result = await decompressFile.call(mockExecuteFunctions, 0);

			expect(result.file).toBe('website.tar.gz');
		});
	});

	describe('error handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home')
				.mockReturnValueOnce('archive.zip');
		});

		it('should propagate API request errors', async () => {
			const error = new Error('API request failed');
			mockPterodactylApiRequest.mockRejectedValue(error);

			await expect(decompressFile.call(mockExecuteFunctions, 0)).rejects.toThrow('API request failed');
		});

		it('should handle file not found errors', async () => {
			const notFoundError = new Error('Archive not found');
			(notFoundError as any).statusCode = 404;
			mockPterodactylApiRequest.mockRejectedValue(notFoundError);

			await expect(decompressFile.call(mockExecuteFunctions, 0)).rejects.toThrow('Archive not found');
		});

		it('should handle invalid archive errors', async () => {
			const validationError = new Error('Invalid or corrupted archive');
			(validationError as any).statusCode = 400;
			mockPterodactylApiRequest.mockRejectedValue(validationError);

			await expect(decompressFile.call(mockExecuteFunctions, 0)).rejects.toThrow('Invalid or corrupted archive');
		});

		it('should handle permission errors', async () => {
			const permissionError = new Error('Permission denied');
			(permissionError as any).statusCode = 403;
			mockPterodactylApiRequest.mockRejectedValue(permissionError);

			await expect(decompressFile.call(mockExecuteFunctions, 0)).rejects.toThrow('Permission denied');
		});
	});
});
