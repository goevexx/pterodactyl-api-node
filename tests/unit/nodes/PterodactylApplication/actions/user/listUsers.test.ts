import { listUsers } from '../../../../../../nodes/PterodactylApplication/actions/user/listUsers.operation';
import { createMockExecuteFunctions } from '../../../../../helpers/mockExecuteFunctions';
import { testApplicationCredentials } from '../../../../../fixtures/testCredentials';

describe('PterodactylApplication - listUsers operation', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = createMockExecuteFunctions();
		mockExecuteFunctions.getCredentials.mockResolvedValue(testApplicationCredentials);
	});

	it('should list users with attributes', async () => {
		const mockResponse = {
			data: [
				{
					object: 'user',
					attributes: {
						id: 1,
						uuid: 'user-uuid-1',
						username: 'testuser1',
						email: 'testuser1@example.com',
					},
				},
				{
					object: 'user',
					attributes: {
						id: 2,
						uuid: 'user-uuid-2',
						username: 'testuser2',
						email: 'testuser2@example.com',
					},
				},
			],
		};

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 200,
			body: mockResponse,
		});

		const result = await listUsers.call(mockExecuteFunctions, 0);

		expect(result).toEqual([
			{
				id: 1,
				uuid: 'user-uuid-1',
				username: 'testuser1',
				email: 'testuser1@example.com',
			},
			{
				id: 2,
				uuid: 'user-uuid-2',
				username: 'testuser2',
				email: 'testuser2@example.com',
			},
		]);
	});

	it('should handle response without data field', async () => {
		const mockResponse = {};

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 200,
			body: mockResponse,
		});

		const result = await listUsers.call(mockExecuteFunctions, 0);

		expect(result).toEqual([]);
	});

	it('should handle response with null data', async () => {
		const mockResponse = {
			data: null,
		};

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 200,
			body: mockResponse,
		});

		const result = await listUsers.call(mockExecuteFunctions, 0);

		expect(result).toEqual([]);
	});

	it('should return items without attributes field directly', async () => {
		const mockResponse = {
			data: [
				{
					id: 1,
					username: 'directuser1',
					email: 'direct1@example.com',
				},
				{
					id: 2,
					username: 'directuser2',
					email: 'direct2@example.com',
				},
			],
		};

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 200,
			body: mockResponse,
		});

		const result = await listUsers.call(mockExecuteFunctions, 0);

		expect(result).toEqual([
			{
				id: 1,
				username: 'directuser1',
				email: 'direct1@example.com',
			},
			{
				id: 2,
				username: 'directuser2',
				email: 'direct2@example.com',
			},
		]);
	});

	it('should use Application API credentials', async () => {
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 200,
			body: {
				data: [],
			},
		});

		await listUsers.call(mockExecuteFunctions, 0);

		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'GET',
				url: expect.stringContaining('/api/application/users'),
			}),
		);
	});
});
