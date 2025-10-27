import { getPermissions } from '../../../../../../nodes/PterodactylClient/actions/subuser/getPermissions.operation';
import { createMockExecuteFunctions } from '../../../../../helpers/mockExecuteFunctions';
import * as transport from '../../../../../../shared/transport';

jest.mock('../../../../../../shared/transport');

describe('PterodactylClient - getPermissions operation', () => {
	let mockExecuteFunctions: any;
	const mockPterodactylApiRequest = transport.pterodactylApiRequest as jest.MockedFunction<
		typeof transport.pterodactylApiRequest
	>;

	beforeEach(() => {
		mockExecuteFunctions = createMockExecuteFunctions();
		mockExecuteFunctions.getCredentials.mockResolvedValue({
			panelUrl: 'https://panel.example.com',
			apiKey: 'ptlc_test_key',
		});
		jest.clearAllMocks();
	});

	it('should get available permissions with all categories', async () => {
		const mockResponse = {
			object: 'system_permissions',
			attributes: {
				permissions: {
					websocket: {
						description: 'Allows the user to connect to the server websocket.',
						keys: {
							connect: 'Allows a user to connect to the websocket instance.',
						},
					},
					control: {
						description: 'Permissions that control server power state.',
						keys: {
							console: 'Allows a user to send commands to the server instance.',
							start: 'Allows a user to start the server if it is stopped.',
							stop: 'Allows a user to stop a server if it is running.',
							restart: 'Allows a user to perform a server restart.',
						},
					},
					user: {
						description: 'Permissions that control user management.',
						keys: {
							create: 'Allows a user to create new subusers for the server.',
							read: 'Allows the user to view subusers and their permissions.',
							update: 'Allows a user to modify other subusers.',
							delete: 'Allows a user to delete a subuser from the server.',
						},
					},
				},
			},
		};

		mockPterodactylApiRequest.mockResolvedValue(mockResponse);

		const result = await getPermissions.call(mockExecuteFunctions, 0);

		expect(result).toEqual(mockResponse);
		expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
			'GET',
			'/api/client',
			'/permissions',
			{},
			{},
			{},
			0,
		);
	});

	it('should use correct endpoint', async () => {
		mockPterodactylApiRequest.mockResolvedValue({
			object: 'system_permissions',
			attributes: { permissions: {} },
		});

		await getPermissions.call(mockExecuteFunctions, 0);

		expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
			'GET',
			'/api/client',
			'/permissions',
			expect.any(Object),
			expect.any(Object),
			expect.any(Object),
			0,
		);
	});

	it('should pass correct itemIndex to pterodactylApiRequest', async () => {
		mockPterodactylApiRequest.mockResolvedValue({
			object: 'system_permissions',
			attributes: { permissions: {} },
		});

		await getPermissions.call(mockExecuteFunctions, 3);

		expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
			'GET',
			'/api/client',
			'/permissions',
			{},
			{},
			{},
			3,
		);
	});

	it('should handle empty permissions response', async () => {
		const mockResponse = {
			object: 'system_permissions',
			attributes: {
				permissions: {},
			},
		};

		mockPterodactylApiRequest.mockResolvedValue(mockResponse);

		const result = await getPermissions.call(mockExecuteFunctions, 0);

		expect(result).toEqual(mockResponse);
	});

	it('should not require any node parameters', async () => {
		mockPterodactylApiRequest.mockResolvedValue({
			object: 'system_permissions',
			attributes: { permissions: {} },
		});

		await getPermissions.call(mockExecuteFunctions, 0);

		expect(mockExecuteFunctions.getNodeParameter).not.toHaveBeenCalled();
	});

	it('should handle API errors', async () => {
		const error = new Error('API request failed');
		mockPterodactylApiRequest.mockRejectedValue(error);

		await expect(getPermissions.call(mockExecuteFunctions, 0)).rejects.toThrow(
			'API request failed',
		);
	});

	it('should handle authentication errors', async () => {
		const authError = new Error('Invalid API key');
		(authError as any).statusCode = 401;
		mockPterodactylApiRequest.mockRejectedValue(authError);

		await expect(getPermissions.call(mockExecuteFunctions, 0)).rejects.toThrow('Invalid API key');
	});

	it('should return permissions with multiple categories', async () => {
		const mockResponse = {
			object: 'system_permissions',
			attributes: {
				permissions: {
					control: {
						keys: {
							console: '',
							start: '',
							stop: '',
						},
					},
					file: {
						keys: {
							create: '',
							read: '',
							update: '',
							delete: '',
						},
					},
					backup: {
						keys: {
							create: '',
							read: '',
							delete: '',
						},
					},
				},
			},
		};

		mockPterodactylApiRequest.mockResolvedValue(mockResponse);

		const result = await getPermissions.call(mockExecuteFunctions, 0);

		expect(result).toEqual(mockResponse);
		expect(result.attributes.permissions).toHaveProperty('control');
		expect(result.attributes.permissions).toHaveProperty('file');
		expect(result.attributes.permissions).toHaveProperty('backup');
	});
});
