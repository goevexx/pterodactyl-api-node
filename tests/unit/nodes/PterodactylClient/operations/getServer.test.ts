import { getServer } from '../../../../../nodes/PterodactylClient/actions/server/getServer.operation';
import { createMockExecuteFunctions } from '../../../../helpers/mockExecuteFunctions';

describe('PterodactylClient - getServer operation', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = createMockExecuteFunctions();
		mockExecuteFunctions.getCredentials.mockResolvedValue({
			panelUrl: 'https://panel.example.com',
			apiKey: 'ptlc_test_key',
		});
	});

	it('should fetch server details by identifier', async () => {
		const serverId = 'abc123def';
		mockExecuteFunctions.getNodeParameter.mockReturnValue(serverId);

		const mockServerData = {
			object: 'server',
			attributes: {
				identifier: serverId,
				uuid: 'uuid-123',
				name: 'My Test Server',
				node: 'node1',
				status: 'running',
			},
		};

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 200,
			body: { attributes: mockServerData.attributes },
		});

		const result = await getServer.call(mockExecuteFunctions, 0);

		expect(result).toEqual(mockServerData.attributes);
		expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('serverId', 0);
	});

	it('should use correct API endpoint with server identifier', async () => {
		const serverId = 'testserver123';
		mockExecuteFunctions.getNodeParameter.mockReturnValue(serverId);
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 200,
			body: { attributes: {} },
		});

		await getServer.call(mockExecuteFunctions, 0);

		const callArgs = mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0];
		expect(callArgs.url).toContain(`/api/client/servers/${serverId}`);
	});

	it('should use pterodactylClientApi credentials', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValue('server123');
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 200,
			body: { attributes: {} },
		});

		await getServer.call(mockExecuteFunctions, 0);

		expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 0);
	});

	it('should handle server not found error', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValue('nonexistent');
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 404,
			body: {
				errors: [
					{
						code: 'ResourceNotFoundException',
						detail: 'Server not found',
					},
				],
			},
		});

		await expect(getServer.call(mockExecuteFunctions, 0)).rejects.toThrow();
	});

	it('should handle suspended server', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValue('suspended-server');
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 200,
			body: {
				attributes: {
					identifier: 'suspended-server',
					is_suspended: true,
					status: null,
				},
			},
		});

		const result = await getServer.call(mockExecuteFunctions, 0);

		expect(result.is_suspended).toBe(true);
	});
});
