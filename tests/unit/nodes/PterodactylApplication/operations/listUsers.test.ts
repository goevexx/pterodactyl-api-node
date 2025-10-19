import { listUsers } from '../../../../../nodes/PterodactylApplication/actions/user/listUsers.operation';
import { createMockExecuteFunctions } from '../../../../helpers/mockExecuteFunctions';

describe('PterodactylApplication - listUsers operation', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = createMockExecuteFunctions();
		mockExecuteFunctions.getCredentials.mockResolvedValue({
			panelUrl: 'https://panel.example.com',
			apiKey: 'ptla_test_admin_key',
		});
	});

	it('should fetch all users from Application API', async () => {
		const mockUsers = [
			{
				object: 'user',
				attributes: {
					id: 1,
					username: 'admin',
					email: 'admin@example.com',
					root_admin: true,
				},
			},
			{
				object: 'user',
				attributes: {
					id: 2,
					username: 'user1',
					email: 'user1@example.com',
					root_admin: false,
				},
			},
		];

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 200,
			body: { data: mockUsers },
		});

		const result = await listUsers.call(mockExecuteFunctions, 0);

		expect(result).toEqual(mockUsers);
	});

	it('should use /api/application API base', async () => {
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 200,
			body: { data: [] },
		});

		await listUsers.call(mockExecuteFunctions, 0);

		const callArgs = mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0];
		expect(callArgs.url).toContain('/api/application/users');
	});

	it('should use pterodactylApplicationApi credentials', async () => {
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 200,
			body: { data: [] },
		});

		await listUsers.call(mockExecuteFunctions, 0);

		expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith(
			'pterodactylApplicationApi',
			0,
		);
	});

	it('should return empty array when no users found', async () => {
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 200,
			body: { data: [] },
		});

		const result = await listUsers.call(mockExecuteFunctions, 0);

		expect(result).toEqual([]);
	});

	it('should handle authentication error for Application API', async () => {
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

		await expect(listUsers.call(mockExecuteFunctions, 0)).rejects.toThrow();
	});

	it('should handle insufficient permissions error', async () => {
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 403,
			body: {
				errors: [
					{
						code: 'InsufficientPermissionException',
						detail: 'Application API key does not have admin permissions',
					},
				],
			},
		});

		await expect(listUsers.call(mockExecuteFunctions, 0)).rejects.toThrow();
	});
});
