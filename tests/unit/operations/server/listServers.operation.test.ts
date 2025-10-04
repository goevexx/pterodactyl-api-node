import { listServers } from '../../../../nodes/Pterodactyl/actions/server/listServers.operation';
import { createMockExecuteFunctions } from '../../../helpers/mockExecuteFunctions';
import * as PterodactylApiRequest from '../../../../nodes/Pterodactyl/transport/PterodactylApiRequest';

// Mock the transport module
jest.mock('../../../../nodes/Pterodactyl/transport/PterodactylApiRequest');

describe('listServers operation', () => {
	let mockExecuteFunctions: any;
	const mockPterodactylApiRequest = PterodactylApiRequest.pterodactylApiRequest as jest.MockedFunction<typeof PterodactylApiRequest.pterodactylApiRequest>;
	const mockPterodactylApiRequestAllItems = PterodactylApiRequest.pterodactylApiRequestAllItems as jest.MockedFunction<typeof PterodactylApiRequest.pterodactylApiRequestAllItems>;

	beforeEach(() => {
		mockExecuteFunctions = createMockExecuteFunctions();
		jest.clearAllMocks();
	});

	describe('parameter handling', () => {
		it('should call getNodeParameter with returnAll', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue(true);
			mockPterodactylApiRequestAllItems.mockResolvedValue([]);

			await listServers.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('returnAll', 0);
		});

		it('should call getNodeParameter with limit when returnAll is false', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce(false) // returnAll
				.mockReturnValueOnce(25); // limit

			mockPterodactylApiRequest.mockResolvedValue({ data: [] });

			await listServers.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('returnAll', 0);
			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('limit', 0);
		});
	});

	describe('API request - return all servers', () => {
		beforeEach(() => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue(true); // returnAll = true
		});

		it('should call pterodactylApiRequestAllItems when returnAll is true', async () => {
			const mockServers = [
				{ object: 'server', attributes: { identifier: 'abc123', name: 'Server 1' } },
				{ object: 'server', attributes: { identifier: 'def456', name: 'Server 2' } },
			];
			mockPterodactylApiRequestAllItems.mockResolvedValue(mockServers);

			const result = await listServers.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequestAllItems).toHaveBeenCalledWith(
				'GET',
				'/servers',
				{},
				{},
				0
			);
			expect(result).toEqual(mockServers);
		});

		it('should handle empty server list when returnAll is true', async () => {
			mockPterodactylApiRequestAllItems.mockResolvedValue([]);

			const result = await listServers.call(mockExecuteFunctions, 0);

			expect(result).toEqual([]);
		});

		it('should pass correct itemIndex to pterodactylApiRequestAllItems', async () => {
			mockPterodactylApiRequestAllItems.mockResolvedValue([]);

			await listServers.call(mockExecuteFunctions, 5);

			expect(mockPterodactylApiRequestAllItems).toHaveBeenCalledWith(
				'GET',
				'/servers',
				{},
				{},
				5
			);
		});
	});

	describe('API request - paginated servers', () => {
		it('should call pterodactylApiRequest with limit when returnAll is false', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce(false) // returnAll
				.mockReturnValueOnce(10); // limit

			const mockResponse = {
				data: [
					{ object: 'server', attributes: { identifier: 'abc123', name: 'Server 1' } },
				],
			};
			mockPterodactylApiRequest.mockResolvedValue(mockResponse);

			const result = await listServers.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'GET',
				'/servers',
				{},
				{ per_page: 10 },
				{},
				0
			);
			expect(result).toEqual(mockResponse.data);
		});

		it('should use custom limit value', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce(false) // returnAll
				.mockReturnValueOnce(50); // limit

			mockPterodactylApiRequest.mockResolvedValue({ data: [] });

			await listServers.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'GET',
				'/servers',
				{},
				{ per_page: 50 },
				{},
				0
			);
		});

		it('should handle minimum limit of 1', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce(false) // returnAll
				.mockReturnValueOnce(1); // limit

			mockPterodactylApiRequest.mockResolvedValue({ data: [] });

			await listServers.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'GET',
				'/servers',
				{},
				{ per_page: 1 },
				{},
				0
			);
		});

		it('should handle maximum limit of 100', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce(false) // returnAll
				.mockReturnValueOnce(100); // limit

			mockPterodactylApiRequest.mockResolvedValue({ data: [] });

			await listServers.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'GET',
				'/servers',
				{},
				{ per_page: 100 },
				{},
				0
			);
		});

		it('should pass correct itemIndex to pterodactylApiRequest', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce(false) // returnAll
				.mockReturnValueOnce(25); // limit

			mockPterodactylApiRequest.mockResolvedValue({ data: [] });

			await listServers.call(mockExecuteFunctions, 3);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'GET',
				'/servers',
				{},
				{ per_page: 25 },
				{},
				3
			);
		});
	});

	describe('response transformation', () => {
		it('should return data array when response has data property', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce(false) // returnAll
				.mockReturnValueOnce(10); // limit

			const mockData = [
				{ object: 'server', attributes: { identifier: 'abc123' } },
				{ object: 'server', attributes: { identifier: 'def456' } },
			];
			mockPterodactylApiRequest.mockResolvedValue({ data: mockData });

			const result = await listServers.call(mockExecuteFunctions, 0);

			expect(result).toEqual(mockData);
		});

		it('should return empty array when response.data is undefined', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce(false) // returnAll
				.mockReturnValueOnce(10); // limit

			mockPterodactylApiRequest.mockResolvedValue({});

			const result = await listServers.call(mockExecuteFunctions, 0);

			expect(result).toEqual([]);
		});

		it('should return empty array when response.data is null', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce(false) // returnAll
				.mockReturnValueOnce(10); // limit

			mockPterodactylApiRequest.mockResolvedValue({ data: null });

			const result = await listServers.call(mockExecuteFunctions, 0);

			expect(result).toEqual([]);
		});

		it('should preserve empty data array', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce(false) // returnAll
				.mockReturnValueOnce(10); // limit

			mockPterodactylApiRequest.mockResolvedValue({ data: [] });

			const result = await listServers.call(mockExecuteFunctions, 0);

			expect(result).toEqual([]);
		});
	});

	describe('error handling', () => {
		it('should propagate errors from pterodactylApiRequestAllItems', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue(true); // returnAll = true

			const error = new Error('API request failed');
			mockPterodactylApiRequestAllItems.mockRejectedValue(error);

			await expect(listServers.call(mockExecuteFunctions, 0)).rejects.toThrow('API request failed');
		});

		it('should propagate errors from pterodactylApiRequest', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce(false) // returnAll
				.mockReturnValueOnce(10); // limit

			const error = new Error('Network error');
			mockPterodactylApiRequest.mockRejectedValue(error);

			await expect(listServers.call(mockExecuteFunctions, 0)).rejects.toThrow('Network error');
		});

		it('should handle authentication errors', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue(true);

			const authError = new Error('API key invalid/expired');
			(authError as any).statusCode = 401;
			mockPterodactylApiRequestAllItems.mockRejectedValue(authError);

			await expect(listServers.call(mockExecuteFunctions, 0)).rejects.toThrow('API key invalid/expired');
		});

		it('should handle permission errors', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce(false)
				.mockReturnValueOnce(10);

			const permissionError = new Error('Insufficient permissions');
			(permissionError as any).statusCode = 403;
			mockPterodactylApiRequest.mockRejectedValue(permissionError);

			await expect(listServers.call(mockExecuteFunctions, 0)).rejects.toThrow('Insufficient permissions');
		});
	});
});
