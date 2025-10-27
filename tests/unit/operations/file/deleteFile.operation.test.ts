import { deleteFile } from '../../../../nodes/Pterodactyl/actions/file/deleteFile.operation';
import { createMockExecuteFunctions } from '../../../helpers/mockExecuteFunctions';
import * as PterodactylApiRequest from '../../../../nodes/Pterodactyl/transport/PterodactylApiRequest';

jest.mock('../../../../nodes/Pterodactyl/transport/PterodactylApiRequest');

describe('deleteFile operation', () => {
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

			await expect(deleteFile.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Delete File operation requires Client API credentials. Please configure and select Client API credentials.',
			);
		});

		it('should proceed if Client API credentials are configured', async () => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home')
				.mockReturnValueOnce('file.txt');
			mockPterodactylApiRequest.mockResolvedValue(undefined);

			await deleteFile.call(mockExecuteFunctions, 0);

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
				.mockReturnValueOnce('/var/www')
				.mockReturnValueOnce('old-file.txt');

			await deleteFile.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('serverId', 0);
			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('root', 0);
			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('files', 0);
		});

		it('should split comma-separated files', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home')
				.mockReturnValueOnce('file1.txt,file2.txt,file3.txt');

			await deleteFile.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect((callArgs[2] as any).files).toEqual(['file1.txt', 'file2.txt', 'file3.txt']);
		});

		it('should trim whitespace from file names', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home')
				.mockReturnValueOnce('file1.txt , file2.txt , file3.txt');

			await deleteFile.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect((callArgs[2] as any).files).toEqual(['file1.txt', 'file2.txt', 'file3.txt']);
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
				.mockReturnValueOnce('old-file.txt,temp.log');

			await deleteFile.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'POST',
				'/servers/abc123/files/delete',
				{
					root: '/var/www',
					files: ['old-file.txt', 'temp.log'],
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
				.mockReturnValueOnce('file.txt');

			await deleteFile.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[0]).toBe('POST');
		});

		it('should handle single file deletion', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('xyz789')
				.mockReturnValueOnce('/tmp')
				.mockReturnValueOnce('temp-file.txt');

			await deleteFile.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect((callArgs[2] as any).files).toEqual(['temp-file.txt']);
		});

		it('should handle multiple file deletion', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/logs')
				.mockReturnValueOnce('error.log,access.log,debug.log');

			await deleteFile.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect((callArgs[2] as any).files).toEqual(['error.log', 'access.log', 'debug.log']);
		});
	});

	describe('response handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
		});

		it('should return success response with deleted files', async () => {
			const files = 'file1.txt,file2.txt';
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home')
				.mockReturnValueOnce(files);
			mockPterodactylApiRequest.mockResolvedValue(undefined);

			const result = await deleteFile.call(mockExecuteFunctions, 0);

			expect(result).toEqual({
				success: true,
				deleted: ['file1.txt', 'file2.txt'],
			});
		});

		it('should include all deleted file names in response', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/var/www')
				.mockReturnValueOnce('old-file.txt');
			mockPterodactylApiRequest.mockResolvedValue(undefined);

			const result = await deleteFile.call(mockExecuteFunctions, 0);

			expect(result.deleted).toEqual(['old-file.txt']);
		});

		it('should handle deletion of multiple files', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/temp')
				.mockReturnValueOnce('a.txt,b.txt,c.txt,d.txt');
			mockPterodactylApiRequest.mockResolvedValue(undefined);

			const result = await deleteFile.call(mockExecuteFunctions, 0);

			expect(result.deleted).toEqual(['a.txt', 'b.txt', 'c.txt', 'd.txt']);
			expect(result.deleted.length).toBe(4);
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

			await expect(deleteFile.call(mockExecuteFunctions, 0)).rejects.toThrow('API request failed');
		});

		it('should handle file not found errors', async () => {
			const notFoundError = new Error('File not found');
			(notFoundError as any).statusCode = 404;
			mockPterodactylApiRequest.mockRejectedValue(notFoundError);

			await expect(deleteFile.call(mockExecuteFunctions, 0)).rejects.toThrow('File not found');
		});

		it('should handle permission errors', async () => {
			const permissionError = new Error('Permission denied');
			(permissionError as any).statusCode = 403;
			mockPterodactylApiRequest.mockRejectedValue(permissionError);

			await expect(deleteFile.call(mockExecuteFunctions, 0)).rejects.toThrow('Permission denied');
		});

		it('should handle file in use errors', async () => {
			const inUseError = new Error('File is in use');
			(inUseError as any).statusCode = 409;
			mockPterodactylApiRequest.mockRejectedValue(inUseError);

			await expect(deleteFile.call(mockExecuteFunctions, 0)).rejects.toThrow('File is in use');
		});
	});
});
