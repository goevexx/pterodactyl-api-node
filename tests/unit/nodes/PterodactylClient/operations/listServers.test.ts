import { listServers } from '../../../../../nodes/PterodactylClient/actions/server/listServers.operation';
import { createMockExecuteFunctions } from '../../../../helpers/mockExecuteFunctions';

describe('PterodactylClient - listServers operation', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = createMockExecuteFunctions();
		mockExecuteFunctions.getCredentials.mockResolvedValue({
			panelUrl: 'https://panel.example.com',
			apiKey: 'ptlc_test_key',
		});
	});

	describe('Return All = true', () => {
		it('should fetch all servers using pterodactylApiRequestAllItems', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue(true);

			// Mock the module that pterodactylApiRequestAllItems is imported from
			const mockServers = [
				{ object: 'server', attributes: { identifier: 'server1', name: 'Server 1' } },
				{ object: 'server', attributes: { identifier: 'server2', name: 'Server 2' } },
				{ object: 'server', attributes: { identifier: 'server3', name: 'Server 3' } },
			];

			// Since listServers uses pterodactylApiRequestAllItems internally,
			// we need to mock the httpRequest to return paginated data
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValueOnce({
				statusCode: 200,
				body: {
					data: mockServers,
					meta: { pagination: { total_pages: 1, current_page: 1 } },
				},
			});

			const result = await listServers.call(mockExecuteFunctions, 0);

			expect(result).toEqual(mockServers);
			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('returnAll', 0);
		});

		it('should use /api/client API base', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue(true);
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 200,
				body: {
					data: [],
					meta: { pagination: { total_pages: 1 } },
				},
			});

			await listServers.call(mockExecuteFunctions, 0);

			const callArgs = mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0];
			expect(callArgs.url).toContain('/api/client');
		});

		it('should use pterodactylClientApi credentials', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue(true);
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 200,
				body: {
					data: [],
					meta: { pagination: { total_pages: 1 } },
				},
			});

			await listServers.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 0);
		});
	});

	describe('Return All = false (with limit)', () => {
		it('should fetch limited servers', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce(false) // returnAll
				.mockReturnValueOnce(10); // limit

			const mockServers = [
				{ object: 'server', attributes: { identifier: 'server1', name: 'Server 1' } },
				{ object: 'server', attributes: { identifier: 'server2', name: 'Server 2' } },
			];

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 200,
				body: { data: mockServers },
			});

			const result = await listServers.call(mockExecuteFunctions, 0);

			expect(result).toEqual(mockServers);
			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('returnAll', 0);
			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('limit', 0);
		});

		it('should include per_page query parameter', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce(false).mockReturnValueOnce(25);

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 200,
				body: { data: [] },
			});

			await listServers.call(mockExecuteFunctions, 0);

			const callArgs = mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0];
			expect(callArgs.qs.per_page).toBe(25);
		});

		it('should return empty array when no servers found', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue(false);
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 200,
				body: { data: [] },
			});

			const result = await listServers.call(mockExecuteFunctions, 0);

			expect(result).toEqual([]);
		});
	});

	describe('Error handling', () => {
		it('should handle missing credentials gracefully', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue(true);
			mockExecuteFunctions.getCredentials.mockRejectedValue(new Error('Credentials not found'));

			await expect(listServers.call(mockExecuteFunctions, 0)).rejects.toThrow();
		});

		it('should handle API errors', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue(true);
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 401,
				body: {
					errors: [
						{
							code: 'AuthenticationException',
							detail: 'Invalid API key',
						},
					],
				},
			});

			await expect(listServers.call(mockExecuteFunctions, 0)).rejects.toThrow();
		});
	});
});
