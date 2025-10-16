import { writeFile } from '../../../../nodes/Pterodactyl/actions/file/writeFile.operation';
import { createMockExecuteFunctions } from '../../../helpers/mockExecuteFunctions';
import * as PterodactylApiRequest from '../../../../nodes/Pterodactyl/transport/PterodactylApiRequest';

jest.mock('../../../../nodes/Pterodactyl/transport/PterodactylApiRequest');

describe('writeFile operation', () => {
	let mockExecuteFunctions: any;
	const mockPterodactylApiRequest = PterodactylApiRequest.pterodactylApiRequest as jest.MockedFunction<typeof PterodactylApiRequest.pterodactylApiRequest>;

	beforeEach(() => {
		mockExecuteFunctions = createMockExecuteFunctions();
		jest.clearAllMocks();
	});

	describe('credential validation', () => {
		it('should throw error if Client API credentials are not configured', async () => {
			mockExecuteFunctions.getCredentials.mockRejectedValue(new Error('No credentials'));

			await expect(writeFile.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Write File operation requires Client API credentials. Please configure and select Client API credentials.',
			);
		});

		it('should proceed if Client API credentials are configured', async () => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home/file.txt')
				.mockReturnValueOnce('content');
			mockPterodactylApiRequest.mockResolvedValue(undefined);

			await writeFile.call(mockExecuteFunctions, 0);

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
				.mockReturnValueOnce('/var/www/index.html')
				.mockReturnValueOnce('<html></html>');

			await writeFile.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('serverId', 0);
			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('filePath', 0);
			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('content', 0);
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
				.mockReturnValueOnce('/home/config.txt')
				.mockReturnValueOnce('key=value\nport=3000');

			await writeFile.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'POST',
				'/servers/abc123/files/write',
				{},
				{ file: '/home/config.txt' },
				{
					body: 'key=value\nport=3000',
					json: false,
					headers: {
						'Content-Type': 'text/plain',
					},
				},
			);
		});

		it('should use POST method', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home/file.txt')
				.mockReturnValueOnce('content');

			await writeFile.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[0]).toBe('POST');
		});

		it('should send raw content with text/plain content type', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('xyz789')
				.mockReturnValueOnce('/etc/app.conf')
				.mockReturnValueOnce('setting=enabled');

			await writeFile.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect((callArgs[4] as any).json).toBe(false);
			expect((callArgs[4] as any).headers['Content-Type']).toBe('text/plain');
			expect((callArgs[4] as any).body).toBe('setting=enabled');
		});

		it('should pass filePath as query parameter', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/var/www/readme.md')
				.mockReturnValueOnce('# README\nProject info');

			await writeFile.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[3]).toEqual({ file: '/var/www/readme.md' });
		});

		it('should handle empty content', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home/empty.txt')
				.mockReturnValueOnce('');

			await writeFile.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect((callArgs[4] as any).body).toBe('');
		});

		it('should handle multiline content', async () => {
			const multilineContent = 'Line 1\nLine 2\nLine 3\nLine 4';
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home/notes.txt')
				.mockReturnValueOnce(multilineContent);

			await writeFile.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect((callArgs[4] as any).body).toBe(multilineContent);
		});

		it('should handle JSON content as text', async () => {
			const jsonContent = '{"name": "test", "value": 123}';
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/config/settings.json')
				.mockReturnValueOnce(jsonContent);

			await writeFile.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect((callArgs[4] as any).body).toBe(jsonContent);
			expect((callArgs[4] as any).json).toBe(false);
		});
	});

	describe('response handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
		});

		it('should return success response with filePath', async () => {
			const filePath = '/home/document.txt';
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce(filePath)
				.mockReturnValueOnce('File content');
			mockPterodactylApiRequest.mockResolvedValue(undefined);

			const result = await writeFile.call(mockExecuteFunctions, 0);

			expect(result).toEqual({
				success: true,
				filePath: filePath,
			});
		});

		it('should include written file path in response', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/var/www/index.html')
				.mockReturnValueOnce('<html><body>Hello</body></html>');
			mockPterodactylApiRequest.mockResolvedValue(undefined);

			const result = await writeFile.call(mockExecuteFunctions, 0);

			expect(result.filePath).toBe('/var/www/index.html');
		});
	});

	describe('error handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('/home/file.txt')
				.mockReturnValueOnce('content');
		});

		it('should propagate API request errors', async () => {
			const error = new Error('API request failed');
			mockPterodactylApiRequest.mockRejectedValue(error);

			await expect(writeFile.call(mockExecuteFunctions, 0)).rejects.toThrow('API request failed');
		});

		it('should handle permission errors', async () => {
			const permissionError = new Error('Permission denied');
			(permissionError as any).statusCode = 403;
			mockPterodactylApiRequest.mockRejectedValue(permissionError);

			await expect(writeFile.call(mockExecuteFunctions, 0)).rejects.toThrow('Permission denied');
		});

		it('should handle disk full errors', async () => {
			const diskFullError = new Error('Insufficient disk space');
			(diskFullError as any).statusCode = 507;
			mockPterodactylApiRequest.mockRejectedValue(diskFullError);

			await expect(writeFile.call(mockExecuteFunctions, 0)).rejects.toThrow('Insufficient disk space');
		});

		it('should handle invalid path errors', async () => {
			const pathError = new Error('Invalid file path');
			(pathError as any).statusCode = 400;
			mockPterodactylApiRequest.mockRejectedValue(pathError);

			await expect(writeFile.call(mockExecuteFunctions, 0)).rejects.toThrow('Invalid file path');
		});

		it('should handle file locked errors', async () => {
			const lockedError = new Error('File is locked');
			(lockedError as any).statusCode = 423;
			mockPterodactylApiRequest.mockRejectedValue(lockedError);

			await expect(writeFile.call(mockExecuteFunctions, 0)).rejects.toThrow('File is locked');
		});
	});
});
