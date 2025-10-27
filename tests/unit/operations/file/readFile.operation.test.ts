import { readFile } from '../../../../nodes/Pterodactyl/actions/file/readFile.operation';
import { createMockExecuteFunctions } from '../../../helpers/mockExecuteFunctions';
import * as PterodactylApiRequest from '../../../../nodes/Pterodactyl/transport/PterodactylApiRequest';

jest.mock('../../../../nodes/Pterodactyl/transport/PterodactylApiRequest');

describe('readFile operation', () => {
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

			await expect(readFile.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Read File operation requires Client API credentials. Please configure and select Client API credentials.',
			);
		});

		it('should proceed if Client API credentials are configured', async () => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home/config.txt');
			mockPterodactylApiRequest.mockResolvedValue('file content');

			await readFile.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 0);
		});
	});

	describe('parameter handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue('content');
		});

		it('should get serverId and filePath parameters', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home/file.txt');

			await readFile.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('serverId', 0);
			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('filePath', 0);
		});
	});

	describe('API request', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue('content');
		});

		it('should call pterodactylApiRequest with correct parameters', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/var/www/index.html');

			await readFile.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'GET',
				'/servers/abc123/files/contents',
				{},
				{ file: '/var/www/index.html' },
			);
		});

		it('should use GET method', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home/file.txt');

			await readFile.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[0]).toBe('GET');
		});

		it('should pass filePath as query parameter', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('xyz789')
				.mockReturnValueOnce('/etc/config.json');

			await readFile.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[3]).toEqual({ file: '/etc/config.json' });
		});
	});

	describe('response handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
		});

		it('should return filePath and content', async () => {
			const filePath = '/home/readme.txt';
			const fileContent = 'Hello World\nThis is a test file.';

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce(filePath);
			mockPterodactylApiRequest.mockResolvedValue(fileContent);

			const result = await readFile.call(mockExecuteFunctions, 0);

			expect(result).toEqual({
				filePath: filePath,
				content: fileContent,
			});
		});

		it('should handle empty file content', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/empty.txt');
			mockPterodactylApiRequest.mockResolvedValue('');

			const result = await readFile.call(mockExecuteFunctions, 0);

			expect(result.content).toBe('');
		});

		it('should handle large file content', async () => {
			const largeContent = 'x'.repeat(10000);
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/large.txt');
			mockPterodactylApiRequest.mockResolvedValue(largeContent);

			const result = await readFile.call(mockExecuteFunctions, 0);

			expect(result.content).toBe(largeContent);
			expect(result.content.length).toBe(10000);
		});

		it('should handle JSON file content', async () => {
			const jsonContent = '{"name": "test", "value": 123}';
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/config.json');
			mockPterodactylApiRequest.mockResolvedValue(jsonContent);

			const result = await readFile.call(mockExecuteFunctions, 0);

			expect(result.content).toBe(jsonContent);
		});
	});

	describe('error handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home/file.txt');
		});

		it('should propagate API request errors', async () => {
			const error = new Error('API request failed');
			mockPterodactylApiRequest.mockRejectedValue(error);

			await expect(readFile.call(mockExecuteFunctions, 0)).rejects.toThrow('API request failed');
		});

		it('should handle file not found errors', async () => {
			const notFoundError = new Error('File not found');
			(notFoundError as any).statusCode = 404;
			mockPterodactylApiRequest.mockRejectedValue(notFoundError);

			await expect(readFile.call(mockExecuteFunctions, 0)).rejects.toThrow('File not found');
		});

		it('should handle permission errors', async () => {
			const permissionError = new Error('Permission denied');
			(permissionError as any).statusCode = 403;
			mockPterodactylApiRequest.mockRejectedValue(permissionError);

			await expect(readFile.call(mockExecuteFunctions, 0)).rejects.toThrow('Permission denied');
		});

		it('should handle file too large errors', async () => {
			const sizeError = new Error('File too large');
			(sizeError as any).statusCode = 413;
			mockPterodactylApiRequest.mockRejectedValue(sizeError);

			await expect(readFile.call(mockExecuteFunctions, 0)).rejects.toThrow('File too large');
		});
	});
});
