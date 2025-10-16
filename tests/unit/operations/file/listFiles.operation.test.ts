import { listFiles } from '../../../../nodes/Pterodactyl/actions/file/listFiles.operation';
import { createMockExecuteFunctions } from '../../../helpers/mockExecuteFunctions';
import * as PterodactylApiRequest from '../../../../nodes/Pterodactyl/transport/PterodactylApiRequest';

jest.mock('../../../../nodes/Pterodactyl/transport/PterodactylApiRequest');

describe('listFiles operation', () => {
	let mockExecuteFunctions: any;
	const mockPterodactylApiRequest = PterodactylApiRequest.pterodactylApiRequest as jest.MockedFunction<typeof PterodactylApiRequest.pterodactylApiRequest>;

	beforeEach(() => {
		mockExecuteFunctions = createMockExecuteFunctions();
		jest.clearAllMocks();
	});

	describe('credential validation', () => {
		it('should throw error if Client API credentials are not configured', async () => {
			mockExecuteFunctions.getCredentials.mockRejectedValue(new Error('No credentials'));

			await expect(listFiles.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'List Files operation requires Client API credentials. Please configure and select Client API credentials.',
			);
		});

		it('should proceed if Client API credentials are configured', async () => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home');
			mockPterodactylApiRequest.mockResolvedValue({ data: [] });

			await listFiles.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 0);
		});
	});

	describe('parameter handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue({ data: [] });
		});

		it('should get serverId and directory parameters', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home');

			await listFiles.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('serverId', 0);
			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('directory', 0);
		});
	});

	describe('API request', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue({ data: [] });
		});

		it('should call pterodactylApiRequest with correct parameters', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/var/www');

			await listFiles.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'GET',
				'/servers/abc123/files/list',
				{},
				{ directory: '/var/www' },
			);
		});

		it('should use GET method', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home');

			await listFiles.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[0]).toBe('GET');
		});

		it('should pass directory as query parameter', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('xyz789')
				.mockReturnValueOnce('/etc');

			await listFiles.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[3]).toEqual({ directory: '/etc' });
		});
	});

	describe('response transformation', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home');
		});

		it('should return data array from response', async () => {
			const mockFiles = [
				{
					name: 'file1.txt',
					mode: '-rw-r--r--',
					size: 1024,
					is_file: true,
				},
				{
					name: 'folder',
					mode: 'drwxr-xr-x',
					size: 4096,
					is_file: false,
				},
			];

			mockPterodactylApiRequest.mockResolvedValue({ data: mockFiles });

			const result = await listFiles.call(mockExecuteFunctions, 0);

			expect(result).toEqual(mockFiles);
		});

		it('should return empty array when response.data is undefined', async () => {
			mockPterodactylApiRequest.mockResolvedValue({});

			const result = await listFiles.call(mockExecuteFunctions, 0);

			expect(result).toEqual([]);
		});

		it('should return empty array when response.data is null', async () => {
			mockPterodactylApiRequest.mockResolvedValue({ data: null });

			const result = await listFiles.call(mockExecuteFunctions, 0);

			expect(result).toEqual([]);
		});

		it('should preserve empty data array', async () => {
			mockPterodactylApiRequest.mockResolvedValue({ data: [] });

			const result = await listFiles.call(mockExecuteFunctions, 0);

			expect(result).toEqual([]);
		});

		it('should handle multiple files and folders', async () => {
			const mockFiles = Array.from({ length: 10 }, (_, i) => ({
				name: `file${i}.txt`,
				size: i * 100,
				is_file: i % 2 === 0,
			}));

			mockPterodactylApiRequest.mockResolvedValue({ data: mockFiles });

			const result = await listFiles.call(mockExecuteFunctions, 0);

			expect(result).toEqual(mockFiles);
			expect(result.length).toBe(10);
		});
	});

	describe('error handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home');
		});

		it('should propagate API request errors', async () => {
			const error = new Error('API request failed');
			mockPterodactylApiRequest.mockRejectedValue(error);

			await expect(listFiles.call(mockExecuteFunctions, 0)).rejects.toThrow('API request failed');
		});

		it('should handle directory not found errors', async () => {
			const notFoundError = new Error('Directory not found');
			(notFoundError as any).statusCode = 404;
			mockPterodactylApiRequest.mockRejectedValue(notFoundError);

			await expect(listFiles.call(mockExecuteFunctions, 0)).rejects.toThrow('Directory not found');
		});

		it('should handle permission errors', async () => {
			const permissionError = new Error('Permission denied');
			(permissionError as any).statusCode = 403;
			mockPterodactylApiRequest.mockRejectedValue(permissionError);

			await expect(listFiles.call(mockExecuteFunctions, 0)).rejects.toThrow('Permission denied');
		});
	});
});
