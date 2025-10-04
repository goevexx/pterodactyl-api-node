import { pterodactylApiRequestAllItems } from '../../../nodes/Pterodactyl/transport/PterodactylApiRequest';
import { createMockExecuteFunctions } from '../../helpers/mockExecuteFunctions';
import { testClientCredentials } from '../../fixtures/testCredentials';

describe('pterodactylApiRequestAllItems', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = createMockExecuteFunctions();
		mockExecuteFunctions.getNodeParameter.mockReturnValue('clientApi');
		mockExecuteFunctions.getCredentials.mockResolvedValue(testClientCredentials);
	});

	describe('pagination', () => {
		it('should fetch single page when no pagination metadata', async () => {
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 200,
				body: {
					data: [{ id: 1, name: 'Server 1' }],
				},
			});

			const result = await pterodactylApiRequestAllItems.call(
				mockExecuteFunctions,
				'GET',
				'/servers',
				{},
				{},
				0
			);

			expect(result).toEqual([{ id: 1, name: 'Server 1' }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledTimes(1);
		});

		it('should fetch multiple pages until no more pages', async () => {
			mockExecuteFunctions.helpers.httpRequest
				.mockResolvedValueOnce({
					statusCode: 200,
					body: {
						data: [{ id: 1, name: 'Server 1' }],
						meta: {
							pagination: {
								total: 3,
								count: 1,
								per_page: 1,
								current_page: 1,
								total_pages: 3,
							},
						},
					},
				})
				.mockResolvedValueOnce({
					statusCode: 200,
					body: {
						data: [{ id: 2, name: 'Server 2' }],
						meta: {
							pagination: {
								total: 3,
								count: 1,
								per_page: 1,
								current_page: 2,
								total_pages: 3,
							},
						},
					},
				})
				.mockResolvedValueOnce({
					statusCode: 200,
					body: {
						data: [{ id: 3, name: 'Server 3' }],
						meta: {
							pagination: {
								total: 3,
								count: 1,
								per_page: 1,
								current_page: 3,
								total_pages: 3,
							},
						},
					},
				});

			const result = await pterodactylApiRequestAllItems.call(
				mockExecuteFunctions,
				'GET',
				'/servers',
				{},
				{},
				0
			);

			expect(result).toEqual([
				{ id: 1, name: 'Server 1' },
				{ id: 2, name: 'Server 2' },
				{ id: 3, name: 'Server 3' },
			]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledTimes(3);
		});

		it('should aggregate data from all pages', async () => {
			mockExecuteFunctions.helpers.httpRequest
				.mockResolvedValueOnce({
					statusCode: 200,
					body: {
						data: [{ id: 1 }, { id: 2 }],
						meta: {
							pagination: {
								current_page: 1,
								total_pages: 2,
							},
						},
					},
				})
				.mockResolvedValueOnce({
					statusCode: 200,
					body: {
						data: [{ id: 3 }, { id: 4 }],
						meta: {
							pagination: {
								current_page: 2,
								total_pages: 2,
							},
						},
					},
				});

			const result = await pterodactylApiRequestAllItems.call(
				mockExecuteFunctions,
				'GET',
				'/servers',
				{},
				{},
				0
			);

			expect(result).toHaveLength(4);
			expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
		});

		it('should handle empty first page', async () => {
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 200,
				body: {
					data: [],
				},
			});

			const result = await pterodactylApiRequestAllItems.call(
				mockExecuteFunctions,
				'GET',
				'/servers',
				{},
				{},
				0
			);

			expect(result).toEqual([]);
		});

		it('should propagate errors during pagination', async () => {
			mockExecuteFunctions.helpers.httpRequest
				.mockResolvedValueOnce({
					statusCode: 200,
					body: {
						data: [{ id: 1 }],
						meta: {
							pagination: {
								current_page: 1,
								total_pages: 2,
							},
						},
					},
				})
				.mockResolvedValueOnce({
					statusCode: 500,
					statusMessage: 'Internal Server Error',
					body: {},
				});

			await expect(
				pterodactylApiRequestAllItems.call(mockExecuteFunctions, 'GET', '/servers', {}, {}, 0)
			).rejects.toThrow();
		});
	});

	describe('query parameter handling', () => {
		it('should include page parameter in request', async () => {
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 200,
				body: {
					data: [{ id: 1 }],
				},
			});

			await pterodactylApiRequestAllItems.call(
				mockExecuteFunctions,
				'GET',
				'/servers',
				{},
				{},
				0
			);

			const callArgs = mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0];
			expect(callArgs.qs).toHaveProperty('page', 1);
		});

		it('should preserve existing query string parameters', async () => {
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 200,
				body: {
					data: [{ id: 1 }],
				},
			});

			await pterodactylApiRequestAllItems.call(
				mockExecuteFunctions,
				'GET',
				'/servers',
				{},
				{ filter: 'test' },
				0
			);

			const callArgs = mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0];
			expect(callArgs.qs).toEqual({ filter: 'test', page: 1 });
		});

		it('should increment page parameter for each request', async () => {
			mockExecuteFunctions.helpers.httpRequest
				.mockResolvedValueOnce({
					statusCode: 200,
					body: {
						data: [{ id: 1 }],
						meta: {
							pagination: {
								current_page: 1,
								total_pages: 3,
							},
						},
					},
				})
				.mockResolvedValueOnce({
					statusCode: 200,
					body: {
						data: [{ id: 2 }],
						meta: {
							pagination: {
								current_page: 2,
								total_pages: 3,
							},
						},
					},
				})
				.mockResolvedValueOnce({
					statusCode: 200,
					body: {
						data: [{ id: 3 }],
						meta: {
							pagination: {
								current_page: 3,
								total_pages: 3,
							},
						},
					},
				});

			await pterodactylApiRequestAllItems.call(
				mockExecuteFunctions,
				'GET',
				'/servers',
				{},
				{},
				0
			);

			expect(mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0].qs.page).toBe(1);
			expect(mockExecuteFunctions.helpers.httpRequest.mock.calls[1][0].qs.page).toBe(2);
			expect(mockExecuteFunctions.helpers.httpRequest.mock.calls[2][0].qs.page).toBe(3);
		});
	});
});
