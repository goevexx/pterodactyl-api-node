import { getServer } from '../../../../../../nodes/PterodactylClient/actions/server/getServer.operation';
import { createMockExecuteFunctions } from '../../../../../helpers/mockExecuteFunctions';

describe('PterodactylClient - getServer operation', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = createMockExecuteFunctions();
		mockExecuteFunctions.getCredentials.mockResolvedValue({
			panelUrl: 'https://panel.example.com',
			apiKey: 'ptlc_test_key',
		});
	});

	it('should get server with attributes', async () => {
		const serverId = 'abc123';
		mockExecuteFunctions.getNodeParameter.mockReturnValue(serverId);

		const mockResponse = {
			object: 'server',
			attributes: {
				uuid: 'server-uuid',
				name: 'Test Server',
				identifier: 'testserver',
				description: 'Test server description',
			},
		};

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 200,
			body: mockResponse,
		});

		const result = await getServer.call(mockExecuteFunctions, 0);

		expect(result).toEqual({
			uuid: 'server-uuid',
			name: 'Test Server',
			identifier: 'testserver',
			description: 'Test server description',
		});
		expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('serverId', 0);
	});

	it('should handle response without attributes field', async () => {
		const serverId = 'abc123';
		mockExecuteFunctions.getNodeParameter.mockReturnValue(serverId);

		const mockResponse = {
			uuid: 'server-uuid',
			name: 'Direct Server',
			identifier: 'directserver',
		};

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 200,
			body: mockResponse,
		});

		const result = await getServer.call(mockExecuteFunctions, 0);

		expect(result).toEqual({
			uuid: 'server-uuid',
			name: 'Direct Server',
			identifier: 'directserver',
		});
	});

	it('should use correct endpoint with serverId', async () => {
		const serverId = 'test-server-123';
		mockExecuteFunctions.getNodeParameter.mockReturnValue(serverId);

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 200,
			body: {
				attributes: { uuid: 'test' },
			},
		});

		await getServer.call(mockExecuteFunctions, 0);

		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: 'GET',
				url: expect.stringContaining(`/api/client/servers/${serverId}`),
			}),
		);
	});

	it('should use Client API credentials', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValue('server123');
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 200,
			body: {
				attributes: {},
			},
		});

		await getServer.call(mockExecuteFunctions, 0);

		expect(mockExecuteFunctions.getCredentials).toHaveBeenCalled();
	});

	it('should handle empty response', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValue('server123');

		const mockResponse = {};

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 200,
			body: mockResponse,
		});

		const result = await getServer.call(mockExecuteFunctions, 0);

		expect(result).toEqual({});
	});
});
