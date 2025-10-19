import { listServers } from '../../../../../nodes/PterodactylApplication/actions/server/listServers.operation';
import { createMockExecuteFunctions } from '../../../../helpers/mockExecuteFunctions';

describe('PterodactylApplication - listServers operation', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = createMockExecuteFunctions();
		mockExecuteFunctions.getCredentials.mockResolvedValue({
			panelUrl: 'https://panel.example.com',
			apiKey: 'ptla_test_admin_key',
		});
	});

	it('should fetch all servers using Application API', async () => {
		const mockServers = [
			{
				object: 'server',
				attributes: {
					id: 1,
					identifier: 'server1',
					uuid: 'uuid-1',
					name: 'Production Server',
					suspended: false,
				},
			},
			{
				object: 'server',
				attributes: {
					id: 2,
					identifier: 'server2',
					uuid: 'uuid-2',
					name: 'Dev Server',
					suspended: false,
				},
			},
		];

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 200,
			body: { data: mockServers },
		});

		const result = await listServers.call(mockExecuteFunctions, 0);

		expect(result).toEqual(mockServers);
	});

	it('should use /api/application API base', async () => {
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 200,
			body: { data: [] },
		});

		await listServers.call(mockExecuteFunctions, 0);

		const callArgs = mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0];
		expect(callArgs.url).toContain('/api/application/servers');
	});

	it('should use pterodactylApplicationApi credentials', async () => {
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 200,
			body: { data: [] },
		});

		await listServers.call(mockExecuteFunctions, 0);

		expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith(
			'pterodactylApplicationApi',
			0,
		);
	});

	it('should return empty array when no servers exist', async () => {
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 200,
			body: { data: [] },
		});

		const result = await listServers.call(mockExecuteFunctions, 0);

		expect(result).toEqual([]);
	});

	it('should handle Application API authentication errors', async () => {
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 401,
			body: {
				errors: [
					{
						code: 'AuthenticationException',
						detail: 'Invalid Application API key',
					},
				],
			},
		});

		await expect(listServers.call(mockExecuteFunctions, 0)).rejects.toThrow();
	});

	it('should include server details in response', async () => {
		const serverWithDetails = {
			object: 'server',
			attributes: {
				id: 1,
				external_id: 'ext-123',
				identifier: 'abcdef12',
				uuid: 'full-uuid',
				name: 'Test Server',
				description: 'A test server',
				suspended: false,
				limits: {
					memory: 2048,
					disk: 10240,
					cpu: 100,
				},
			},
		};

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 200,
			body: { data: [serverWithDetails] },
		});

		const result = await listServers.call(mockExecuteFunctions, 0);

		expect(result[0].attributes).toHaveProperty('limits');
		expect(result[0].attributes.limits.memory).toBe(2048);
	});
});
