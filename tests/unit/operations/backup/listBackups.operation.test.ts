import { listBackups } from '../../../../nodes/Pterodactyl/actions/backup/listBackups.operation';
import { createMockExecuteFunctions } from '../../../helpers/mockExecuteFunctions';
import * as PterodactylApiRequest from '../../../../nodes/Pterodactyl/transport/PterodactylApiRequest';

jest.mock('../../../../nodes/Pterodactyl/transport/PterodactylApiRequest');

describe('listBackups operation', () => {
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

			await expect(listBackups.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'List Backups operation requires Client API credentials. Please configure and select Client API credentials.',
			);
		});

		it('should proceed if Client API credentials are configured', async () => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter.mockReturnValue('abc123');
			mockPterodactylApiRequest.mockResolvedValue({ data: [] });

			await listBackups.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 0);
		});
	});

	describe('parameter handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue({ data: [] });
		});

		it('should get serverId parameter', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('abc123');

			await listBackups.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('serverId', 0);
		});
	});

	describe('API request', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue({ data: [] });
		});

		it('should call pterodactylApiRequest with correct parameters', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('abc123');

			await listBackups.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'GET',
				'/servers/abc123/backups',
				{},
				{},
				{},
				0,
			);
		});

		it('should use GET method', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('abc123');

			await listBackups.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[0]).toBe('GET');
		});

		it('should construct endpoint with serverId', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('xyz789');

			await listBackups.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[1]).toBe('/servers/xyz789/backups');
		});
	});

	describe('response transformation', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter.mockReturnValue('abc123');
		});

		it('should return data array from response', async () => {
			const mockBackups = [
				{
					object: 'backup',
					attributes: { uuid: 'backup-1', name: 'Backup 1' },
				},
				{
					object: 'backup',
					attributes: { uuid: 'backup-2', name: 'Backup 2' },
				},
			];

			mockPterodactylApiRequest.mockResolvedValue({ data: mockBackups });

			const result = await listBackups.call(mockExecuteFunctions, 0);

			expect(result).toEqual(mockBackups);
		});

		it('should return empty array when response.data is undefined', async () => {
			mockPterodactylApiRequest.mockResolvedValue({});

			const result = await listBackups.call(mockExecuteFunctions, 0);

			expect(result).toEqual([]);
		});

		it('should return empty array when response.data is null', async () => {
			mockPterodactylApiRequest.mockResolvedValue({ data: null });

			const result = await listBackups.call(mockExecuteFunctions, 0);

			expect(result).toEqual([]);
		});

		it('should preserve empty data array', async () => {
			mockPterodactylApiRequest.mockResolvedValue({ data: [] });

			const result = await listBackups.call(mockExecuteFunctions, 0);

			expect(result).toEqual([]);
		});

		it('should handle multiple backups', async () => {
			const mockBackups = Array.from({ length: 10 }, (_, i) => ({
				object: 'backup',
				attributes: { uuid: `backup-${i}`, name: `Backup ${i}` },
			}));

			mockPterodactylApiRequest.mockResolvedValue({ data: mockBackups });

			const result = await listBackups.call(mockExecuteFunctions, 0);

			expect(result).toEqual(mockBackups);
			expect(result.length).toBe(10);
		});
	});

	describe('error handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter.mockReturnValue('abc123');
		});

		it('should propagate API request errors', async () => {
			const error = new Error('API request failed');
			mockPterodactylApiRequest.mockRejectedValue(error);

			await expect(listBackups.call(mockExecuteFunctions, 0)).rejects.toThrow('API request failed');
		});

		it('should handle server not found errors', async () => {
			const notFoundError = new Error('Server not found');
			(notFoundError as any).statusCode = 404;
			mockPterodactylApiRequest.mockRejectedValue(notFoundError);

			await expect(listBackups.call(mockExecuteFunctions, 0)).rejects.toThrow('Server not found');
		});
	});
});
