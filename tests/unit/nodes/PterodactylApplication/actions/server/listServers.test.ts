import { listServers } from '../../../../../../nodes/PterodactylApplication/actions/server/listServers.operation';
import { createMockExecuteFunctions } from '../../../../../helpers/mockExecuteFunctions';
import { testApplicationCredentials } from '../../../../../fixtures/testCredentials';

describe('PterodactylApplication - listServers operation', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = createMockExecuteFunctions();
		mockExecuteFunctions.getCredentials.mockResolvedValue(testApplicationCredentials);
	});

	it('should list servers with attributes', async () => {
		const mockResponse = {
			data: [
				{
					object: 'server',
					attributes: {
						id: 1,
						uuid: 'server-uuid-1',
						name: 'Test Server 1',
						identifier: 'test1',
					},
				},
				{
					object: 'server',
					attributes: {
						id: 2,
						uuid: 'server-uuid-2',
						name: 'Test Server 2',
						identifier: 'test2',
					},
				},
			],
		};

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 200,
			body: mockResponse,
		});

		const result = await listServers.call(mockExecuteFunctions, 0);

		expect(result).toEqual([
			{
				id: 1,
				uuid: 'server-uuid-1',
				name: 'Test Server 1',
				identifier: 'test1',
			},
			{
				id: 2,
				uuid: 'server-uuid-2',
				name: 'Test Server 2',
				identifier: 'test2',
			},
		]);
	});

	it('should handle response without data field', async () => {
		const mockResponse = {};

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 200,
			body: mockResponse,
		});

		const result = await listServers.call(mockExecuteFunctions, 0);

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

		const result = await listServers.call(mockExecuteFunctions, 0);

		expect(result).toEqual([]);
	});

	it('should return items without attributes field directly', async () => {
		const mockResponse = {
			data: [
				{
					id: 1,
					name: 'Direct Item 1',
				},
				{
					id: 2,
					name: 'Direct Item 2',
				},
			],
		};

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 200,
			body: mockResponse,
		});

		const result = await listServers.call(mockExecuteFunctions, 0);

		expect(result).toEqual([
			{
				id: 1,
				name: 'Direct Item 1',
			},
			{
				id: 2,
				name: 'Direct Item 2',
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

		await listServers.call(mockExecuteFunctions, 0);

		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'GET',
				url: expect.stringContaining('/api/application/servers'),
			}),
		);
	});
});
