import { powerAction } from '../../../../nodes/Pterodactyl/actions/server/powerAction.operation';
import { createMockExecuteFunctions } from '../../../helpers/mockExecuteFunctions';
import * as PterodactylApiRequest from '../../../../nodes/Pterodactyl/transport/PterodactylApiRequest';

// Mock the transport module
jest.mock('../../../../nodes/Pterodactyl/transport/PterodactylApiRequest');

describe('powerAction operation', () => {
	let mockExecuteFunctions: any;
	const mockPterodactylApiRequest =
		PterodactylApiRequest.pterodactylApiRequest as jest.MockedFunction<
			typeof PterodactylApiRequest.pterodactylApiRequest
		>;

	beforeEach(() => {
		mockExecuteFunctions = createMockExecuteFunctions();
		jest.clearAllMocks();
	});

	describe('parameter handling', () => {
		it('should call getNodeParameter with serverId', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123def') // serverId
				.mockReturnValueOnce('start'); // powerAction

			mockPterodactylApiRequest.mockResolvedValue({});

			await powerAction.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('serverId', 0);
		});

		it('should call getNodeParameter with powerAction', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123def') // serverId
				.mockReturnValueOnce('stop'); // powerAction

			mockPterodactylApiRequest.mockResolvedValue({});

			await powerAction.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('powerAction', 0);
		});

		it('should handle server identifier with different formats', async () => {
			const testIds = ['abc12def', 'server-123', 'test_server_01'];

			for (const serverId of testIds) {
				jest.clearAllMocks();
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce(serverId)
					.mockReturnValueOnce('start');

				mockPterodactylApiRequest.mockResolvedValue({});

				await powerAction.call(mockExecuteFunctions, 0);

				expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
					'POST',
					`/servers/${serverId}/power`,
					{ signal: 'start' },
					{},
					{},
					0,
				);
			}
		});
	});

	describe('power action - start', () => {
		it('should send start signal to API', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123def')
				.mockReturnValueOnce('start');

			mockPterodactylApiRequest.mockResolvedValue({});

			const result = await powerAction.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'POST',
				'/servers/abc123def/power',
				{ signal: 'start' },
				{},
				{},
				0,
			);
			expect(result).toEqual({
				success: true,
				action: 'start',
				serverId: 'abc123def',
			});
		});

		it('should use POST method for start action', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('server-id')
				.mockReturnValueOnce('start');

			mockPterodactylApiRequest.mockResolvedValue({});

			await powerAction.call(mockExecuteFunctions, 0);

			const [method] = mockPterodactylApiRequest.mock.calls[0];
			expect(method).toBe('POST');
		});
	});

	describe('power action - stop', () => {
		it('should send stop signal to API', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123def')
				.mockReturnValueOnce('stop');

			mockPterodactylApiRequest.mockResolvedValue({});

			const result = await powerAction.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'POST',
				'/servers/abc123def/power',
				{ signal: 'stop' },
				{},
				{},
				0,
			);
			expect(result).toEqual({
				success: true,
				action: 'stop',
				serverId: 'abc123def',
			});
		});

		it('should gracefully stop the server', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('test-server')
				.mockReturnValueOnce('stop');

			mockPterodactylApiRequest.mockResolvedValue({});

			const result = await powerAction.call(mockExecuteFunctions, 0);

			expect(result.action).toBe('stop');
		});
	});

	describe('power action - restart', () => {
		it('should send restart signal to API', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123def')
				.mockReturnValueOnce('restart');

			mockPterodactylApiRequest.mockResolvedValue({});

			const result = await powerAction.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'POST',
				'/servers/abc123def/power',
				{ signal: 'restart' },
				{},
				{},
				0,
			);
			expect(result).toEqual({
				success: true,
				action: 'restart',
				serverId: 'abc123def',
			});
		});
	});

	describe('power action - kill', () => {
		it('should send kill signal to API', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123def')
				.mockReturnValueOnce('kill');

			mockPterodactylApiRequest.mockResolvedValue({});

			const result = await powerAction.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'POST',
				'/servers/abc123def/power',
				{ signal: 'kill' },
				{},
				{},
				0,
			);
			expect(result).toEqual({
				success: true,
				action: 'kill',
				serverId: 'abc123def',
			});
		});

		it('should force kill the server', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('test-server')
				.mockReturnValueOnce('kill');

			mockPterodactylApiRequest.mockResolvedValue({});

			const result = await powerAction.call(mockExecuteFunctions, 0);

			expect(result.action).toBe('kill');
		});
	});

	describe('API request construction', () => {
		it('should construct correct endpoint with serverId', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('my-server-123')
				.mockReturnValueOnce('start');

			mockPterodactylApiRequest.mockResolvedValue({});

			await powerAction.call(mockExecuteFunctions, 0);

			const [, endpoint] = mockPterodactylApiRequest.mock.calls[0];
			expect(endpoint).toBe('/servers/my-server-123/power');
		});

		it('should include signal in request body', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('server-id')
				.mockReturnValueOnce('restart');

			mockPterodactylApiRequest.mockResolvedValue({});

			await powerAction.call(mockExecuteFunctions, 0);

			const [, , body] = mockPterodactylApiRequest.mock.calls[0];
			expect(body).toEqual({ signal: 'restart' });
		});

		it('should pass empty query parameters', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('server-id')
				.mockReturnValueOnce('start');

			mockPterodactylApiRequest.mockResolvedValue({});

			await powerAction.call(mockExecuteFunctions, 0);

			const [, , , queryParams] = mockPterodactylApiRequest.mock.calls[0];
			expect(queryParams).toEqual({});
		});

		it('should pass empty options', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('server-id')
				.mockReturnValueOnce('start');

			mockPterodactylApiRequest.mockResolvedValue({});

			await powerAction.call(mockExecuteFunctions, 0);

			const [, , , , options] = mockPterodactylApiRequest.mock.calls[0];
			expect(options).toEqual({});
		});

		it('should pass correct itemIndex to pterodactylApiRequest', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('server-id')
				.mockReturnValueOnce('start');

			mockPterodactylApiRequest.mockResolvedValue({});

			await powerAction.call(mockExecuteFunctions, 5);

			const [, , , , , index] = mockPterodactylApiRequest.mock.calls[0];
			expect(index).toBe(5);
		});
	});

	describe('response format', () => {
		it('should return success response with action and serverId', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('test-server')
				.mockReturnValueOnce('start');

			mockPterodactylApiRequest.mockResolvedValue({});

			const result = await powerAction.call(mockExecuteFunctions, 0);

			expect(result).toHaveProperty('success', true);
			expect(result).toHaveProperty('action', 'start');
			expect(result).toHaveProperty('serverId', 'test-server');
		});

		it('should return success even if API returns empty response', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('server-123')
				.mockReturnValueOnce('stop');

			mockPterodactylApiRequest.mockResolvedValue(undefined);

			const result = await powerAction.call(mockExecuteFunctions, 0);

			expect(result.success).toBe(true);
		});

		it('should include correct action in response for each power action', async () => {
			const actions = ['start', 'stop', 'restart', 'kill'];

			for (const action of actions) {
				jest.clearAllMocks();
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('server-id')
					.mockReturnValueOnce(action);

				mockPterodactylApiRequest.mockResolvedValue({});

				const result = await powerAction.call(mockExecuteFunctions, 0);

				expect(result.action).toBe(action);
			}
		});
	});

	describe('error handling', () => {
		it('should propagate errors from pterodactylApiRequest', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('server-123')
				.mockReturnValueOnce('start');

			const error = new Error('API request failed');
			mockPterodactylApiRequest.mockRejectedValue(error);

			await expect(powerAction.call(mockExecuteFunctions, 0)).rejects.toThrow('API request failed');
		});

		it('should handle 404 not found error', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('nonexistent-server')
				.mockReturnValueOnce('start');

			const notFoundError = new Error(
				'Resource not found. Check server ID/identifier or endpoint URL.',
			);
			(notFoundError as any).statusCode = 404;
			mockPterodactylApiRequest.mockRejectedValue(notFoundError);

			await expect(powerAction.call(mockExecuteFunctions, 0)).rejects.toThrow('Resource not found');
		});

		it('should handle 403 permission error', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('server-123')
				.mockReturnValueOnce('restart');

			const permissionError = new Error(
				'Insufficient permissions, server suspended, or API key lacks access',
			);
			(permissionError as any).statusCode = 403;
			mockPterodactylApiRequest.mockRejectedValue(permissionError);

			await expect(powerAction.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Insufficient permissions',
			);
		});

		it('should handle 409 conflict error (server suspended or power action in progress)', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('server-123')
				.mockReturnValueOnce('start');

			const conflictError = new Error(
				'Server suspended, power action in progress, or would exceed disk limits',
			);
			(conflictError as any).statusCode = 409;
			mockPterodactylApiRequest.mockRejectedValue(conflictError);

			await expect(powerAction.call(mockExecuteFunctions, 0)).rejects.toThrow('Server suspended');
		});

		it('should handle 401 authentication error', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('server-123')
				.mockReturnValueOnce('stop');

			const authError = new Error('API key invalid/expired');
			(authError as any).statusCode = 401;
			mockPterodactylApiRequest.mockRejectedValue(authError);

			await expect(powerAction.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'API key invalid/expired',
			);
		});

		it('should handle 502 Wings daemon error', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('server-123')
				.mockReturnValueOnce('start');

			const wingsError = new Error('Wings daemon down/unreachable');
			(wingsError as any).statusCode = 502;
			mockPterodactylApiRequest.mockRejectedValue(wingsError);

			await expect(powerAction.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Wings daemon down/unreachable',
			);
		});

		it('should handle network errors', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('server-123')
				.mockReturnValueOnce('restart');

			const networkError = new Error('Network connection failed');
			mockPterodactylApiRequest.mockRejectedValue(networkError);

			await expect(powerAction.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Network connection failed',
			);
		});
	});

	describe('edge cases', () => {
		it('should handle empty server identifier', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('').mockReturnValueOnce('start');

			mockPterodactylApiRequest.mockResolvedValue({});

			const result = await powerAction.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'POST',
				'/servers//power',
				{ signal: 'start' },
				{},
				{},
				0,
			);
			expect(result.serverId).toBe('');
		});

		it('should handle long server identifiers', async () => {
			const longId = 'a'.repeat(100);
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce(longId).mockReturnValueOnce('stop');

			mockPterodactylApiRequest.mockResolvedValue({});

			const result = await powerAction.call(mockExecuteFunctions, 0);

			expect(result.serverId).toBe(longId);
		});

		it('should handle server identifier with special characters', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('server-with-dashes-123')
				.mockReturnValueOnce('kill');

			mockPterodactylApiRequest.mockResolvedValue({});

			await powerAction.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'POST',
				'/servers/server-with-dashes-123/power',
				{ signal: 'kill' },
				{},
				{},
				0,
			);
		});

		it('should handle API response with 204 No Content', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('server-123')
				.mockReturnValueOnce('start');

			mockPterodactylApiRequest.mockResolvedValue('');

			const result = await powerAction.call(mockExecuteFunctions, 0);

			expect(result.success).toBe(true);
		});
	});

	describe('all power actions', () => {
		const powerActions = [
			{ action: 'start', description: 'Start the server' },
			{ action: 'stop', description: 'Stop the server gracefully' },
			{ action: 'restart', description: 'Restart the server' },
			{ action: 'kill', description: 'Force kill the server' },
		];

		powerActions.forEach(({ action, description }) => {
			it(`should handle ${action} action correctly - ${description}`, async () => {
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce('test-server')
					.mockReturnValueOnce(action);

				mockPterodactylApiRequest.mockResolvedValue({});

				const result = await powerAction.call(mockExecuteFunctions, 0);

				expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
					'POST',
					'/servers/test-server/power',
					{ signal: action },
					{},
					{},
					0,
				);

				expect(result).toEqual({
					success: true,
					action: action,
					serverId: 'test-server',
				});
			});
		});
	});
});
