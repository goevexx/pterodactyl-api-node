import { createFolder } from '../../../../nodes/Pterodactyl/actions/file/createFolder.operation';
import { createMockExecuteFunctions } from '../../../helpers/mockExecuteFunctions';
import * as PterodactylApiRequest from '../../../../nodes/Pterodactyl/transport/PterodactylApiRequest';

jest.mock('../../../../nodes/Pterodactyl/transport/PterodactylApiRequest');

describe('createFolder operation', () => {
	let mockExecuteFunctions: any;
	const mockPterodactylApiRequest = PterodactylApiRequest.pterodactylApiRequest as jest.MockedFunction<typeof PterodactylApiRequest.pterodactylApiRequest>;

	beforeEach(() => {
		mockExecuteFunctions = createMockExecuteFunctions();
		jest.clearAllMocks();
	});

	describe('credential validation', () => {
		it('should throw error if Client API credentials are not configured', async () => {
			mockExecuteFunctions.getCredentials.mockRejectedValue(new Error('No credentials'));

			await expect(createFolder.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Create Folder operation requires Client API credentials. Please configure and select Client API credentials.',
			);
		});

		it('should proceed if Client API credentials are configured', async () => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home')
				.mockReturnValueOnce('newfolder');
			mockPterodactylApiRequest.mockResolvedValue(undefined);

			await createFolder.call(mockExecuteFunctions, 0);

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
				.mockReturnValueOnce('/home')
				.mockReturnValueOnce('newfolder');

			await createFolder.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('serverId', 0);
			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('root', 0);
			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('name', 0);
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
				.mockReturnValueOnce('uploads');

			await createFolder.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'POST',
				'/servers/abc123/files/create-folder',
				{
					root: '/var/www',
					name: 'uploads',
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
				.mockReturnValueOnce('test');

			await createFolder.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[0]).toBe('POST');
		});

		it('should include root and name in request body', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('xyz789')
				.mockReturnValueOnce('/data')
				.mockReturnValueOnce('backup');

			await createFolder.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect((callArgs[2] as any).root).toBe('/data');
			expect((callArgs[2] as any).name).toBe('backup');
		});
	});

	describe('response handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue(undefined);
		});

		it('should return success response with full path', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home')
				.mockReturnValueOnce('newfolder');

			const result = await createFolder.call(mockExecuteFunctions, 0);

			expect(result).toEqual({
				success: true,
				folder: '/home/newfolder',
			});
		});

		it('should include created folder full path in response', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/var/www')
				.mockReturnValueOnce('images');

			const result = await createFolder.call(mockExecuteFunctions, 0);

			expect(result.folder).toBe('/var/www/images');
		});
	});

	describe('error handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home')
				.mockReturnValueOnce('newfolder');
		});

		it('should propagate API request errors', async () => {
			const error = new Error('API request failed');
			mockPterodactylApiRequest.mockRejectedValue(error);

			await expect(createFolder.call(mockExecuteFunctions, 0)).rejects.toThrow('API request failed');
		});

		it('should handle folder already exists errors', async () => {
			const conflictError = new Error('Folder already exists');
			(conflictError as any).statusCode = 409;
			mockPterodactylApiRequest.mockRejectedValue(conflictError);

			await expect(createFolder.call(mockExecuteFunctions, 0)).rejects.toThrow('Folder already exists');
		});

		it('should handle invalid folder name errors', async () => {
			const validationError = new Error('Invalid folder name');
			(validationError as any).statusCode = 400;
			mockPterodactylApiRequest.mockRejectedValue(validationError);

			await expect(createFolder.call(mockExecuteFunctions, 0)).rejects.toThrow('Invalid folder name');
		});

		it('should handle permission errors', async () => {
			const permissionError = new Error('Permission denied');
			(permissionError as any).statusCode = 403;
			mockPterodactylApiRequest.mockRejectedValue(permissionError);

			await expect(createFolder.call(mockExecuteFunctions, 0)).rejects.toThrow('Permission denied');
		});
	});
});
