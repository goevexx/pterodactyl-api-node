import { compressFiles } from '../../../../nodes/Pterodactyl/actions/file/compressFiles.operation';
import { createMockExecuteFunctions } from '../../../helpers/mockExecuteFunctions';
import * as PterodactylApiRequest from '../../../../nodes/Pterodactyl/transport/PterodactylApiRequest';

jest.mock('../../../../nodes/Pterodactyl/transport/PterodactylApiRequest');

describe('compressFiles operation', () => {
	let mockExecuteFunctions: any;
	const mockPterodactylApiRequest = PterodactylApiRequest.pterodactylApiRequest as jest.MockedFunction<typeof PterodactylApiRequest.pterodactylApiRequest>;

	beforeEach(() => {
		mockExecuteFunctions = createMockExecuteFunctions();
		jest.clearAllMocks();
	});

	describe('credential validation', () => {
		it('should throw error if Client API credentials are not configured', async () => {
			mockExecuteFunctions.getCredentials.mockRejectedValue(new Error('No credentials'));

			await expect(compressFiles.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Compress Files operation requires Client API credentials. Please configure and select Client API credentials.',
			);
		});

		it('should proceed if Client API credentials are configured', async () => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home')
				.mockReturnValueOnce('file1.txt,file2.txt');
			mockPterodactylApiRequest.mockResolvedValue({});

			await compressFiles.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 0);
		});
	});

	describe('parameter handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue({});
		});

		it('should get all required parameters', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/var/www')
				.mockReturnValueOnce('index.html,style.css');

			await compressFiles.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('serverId', 0);
			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('root', 0);
			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('files', 0);
		});

		it('should split comma-separated files', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home')
				.mockReturnValueOnce('file1.txt,file2.txt,file3.txt');

			await compressFiles.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect((callArgs[2] as any).files).toEqual(['file1.txt', 'file2.txt', 'file3.txt']);
		});

		it('should trim whitespace from file names', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home')
				.mockReturnValueOnce('file1.txt , file2.txt , file3.txt');

			await compressFiles.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect((callArgs[2] as any).files).toEqual(['file1.txt', 'file2.txt', 'file3.txt']);
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
				.mockReturnValueOnce('/var/www')
				.mockReturnValueOnce('index.html,style.css,script.js');

			await compressFiles.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'POST',
				'/servers/abc123/files/compress',
				{
					root: '/var/www',
					files: ['index.html', 'style.css', 'script.js'],
				},
			);
		});

		it('should use POST method', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home')
				.mockReturnValueOnce('file.txt');

			await compressFiles.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[0]).toBe('POST');
		});

		it('should handle single file', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('xyz789')
				.mockReturnValueOnce('/data')
				.mockReturnValueOnce('large-file.log');

			await compressFiles.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect((callArgs[2] as any).files).toEqual(['large-file.log']);
		});

		it('should handle multiple files with various extensions', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/backup')
				.mockReturnValueOnce('config.json,data.db,logs.txt,readme.md');

			await compressFiles.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect((callArgs[2] as any).files).toEqual(['config.json', 'data.db', 'logs.txt', 'readme.md']);
		});
	});

	describe('response handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
		});

		it('should return archive details', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home')
				.mockReturnValueOnce('file1.txt,file2.txt');

			const mockResponse = {
				object: 'file',
				attributes: {
					name: 'archive-2023-01-01.tar.gz',
					size: 102400,
				},
			};

			mockPterodactylApiRequest.mockResolvedValue(mockResponse);

			const result = await compressFiles.call(mockExecuteFunctions, 0);

			expect(result).toEqual(mockResponse);
		});

		it('should preserve all archive attributes', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/var/www')
				.mockReturnValueOnce('website.zip');

			const mockResponse = {
				attributes: {
					name: 'website-backup.tar.gz',
					mode: '-rw-r--r--',
					size: 524288,
					is_file: true,
					created_at: '2023-01-01T00:00:00+00:00',
				},
			};

			mockPterodactylApiRequest.mockResolvedValue(mockResponse);

			const result = await compressFiles.call(mockExecuteFunctions, 0);

			expect(result.attributes.name).toBeDefined();
			expect(result.attributes.size).toBeDefined();
		});
	});

	describe('error handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home')
				.mockReturnValueOnce('file.txt');
		});

		it('should propagate API request errors', async () => {
			const error = new Error('API request failed');
			mockPterodactylApiRequest.mockRejectedValue(error);

			await expect(compressFiles.call(mockExecuteFunctions, 0)).rejects.toThrow('API request failed');
		});

		it('should handle file not found errors', async () => {
			const notFoundError = new Error('One or more files not found');
			(notFoundError as any).statusCode = 404;
			mockPterodactylApiRequest.mockRejectedValue(notFoundError);

			await expect(compressFiles.call(mockExecuteFunctions, 0)).rejects.toThrow('One or more files not found');
		});

		it('should handle insufficient disk space errors', async () => {
			const spaceError = new Error('Insufficient disk space');
			(spaceError as any).statusCode = 507;
			mockPterodactylApiRequest.mockRejectedValue(spaceError);

			await expect(compressFiles.call(mockExecuteFunctions, 0)).rejects.toThrow('Insufficient disk space');
		});

		it('should handle permission errors', async () => {
			const permissionError = new Error('Permission denied');
			(permissionError as any).statusCode = 403;
			mockPterodactylApiRequest.mockRejectedValue(permissionError);

			await expect(compressFiles.call(mockExecuteFunctions, 0)).rejects.toThrow('Permission denied');
		});
	});
});
