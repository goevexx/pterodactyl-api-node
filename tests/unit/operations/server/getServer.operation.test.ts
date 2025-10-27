import { getServer } from '../../../../nodes/Pterodactyl/actions/server/getServer.operation';
import { createMockExecuteFunctions } from '../../../helpers/mockExecuteFunctions';
import * as PterodactylApiRequest from '../../../../nodes/Pterodactyl/transport/PterodactylApiRequest';

// Mock the transport module
jest.mock('../../../../nodes/Pterodactyl/transport/PterodactylApiRequest');

describe('getServer operation', () => {
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
			mockExecuteFunctions.getNodeParameter.mockReturnValue('abc123def');
			mockPterodactylApiRequest.mockResolvedValue({});

			await getServer.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('serverId', 0);
		});

		it('should handle numeric server IDs (Application API)', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('42');
			mockPterodactylApiRequest.mockResolvedValue({
				object: 'server',
				attributes: { id: 42, identifier: 'abc123' },
			});

			await getServer.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith('GET', '/servers/42');
		});

		it('should handle alphanumeric identifiers (Client API)', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('abc12def');
			mockPterodactylApiRequest.mockResolvedValue({
				object: 'server',
				attributes: { identifier: 'abc12def' },
			});

			await getServer.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith('GET', '/servers/abc12def');
		});

		it('should handle server IDs with special characters', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('server-123-abc');
			mockPterodactylApiRequest.mockResolvedValue({
				object: 'server',
				attributes: { identifier: 'server-123-abc' },
			});

			await getServer.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith('GET', '/servers/server-123-abc');
		});
	});

	describe('API request construction', () => {
		it('should call pterodactylApiRequest with correct endpoint', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('test-server-id');
			mockPterodactylApiRequest.mockResolvedValue({
				object: 'server',
				attributes: { identifier: 'test-server-id' },
			});

			await getServer.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith('GET', '/servers/test-server-id');
		});

		it('should use GET method', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('server-123');
			mockPterodactylApiRequest.mockResolvedValue({});

			await getServer.call(mockExecuteFunctions, 0);

			const [method] = mockPterodactylApiRequest.mock.calls[0];
			expect(method).toBe('GET');
		});

		it('should construct endpoint with serverId in path', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('my-server-123');
			mockPterodactylApiRequest.mockResolvedValue({});

			await getServer.call(mockExecuteFunctions, 0);

			const [, endpoint] = mockPterodactylApiRequest.mock.calls[0];
			expect(endpoint).toBe('/servers/my-server-123');
		});

		it('should pass correct itemIndex to pterodactylApiRequest', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('server-id');
			mockPterodactylApiRequest.mockResolvedValue({});

			await getServer.call(mockExecuteFunctions, 7);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('serverId', 7);
		});
	});

	describe('response transformation', () => {
		it('should return attributes when response has attributes property', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('abc123');

			const mockAttributes = {
				identifier: 'abc123',
				uuid: '12345678-1234-1234-1234-123456789012',
				name: 'My Server',
				description: 'Test server',
				limits: { memory: 1024, disk: 5120, cpu: 100 },
			};

			mockPterodactylApiRequest.mockResolvedValue({
				object: 'server',
				attributes: mockAttributes,
			});

			const result = await getServer.call(mockExecuteFunctions, 0);

			expect(result).toEqual(mockAttributes);
		});

		it('should return full response when no attributes property', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('server-123');

			const mockResponse = {
				identifier: 'server-123',
				name: 'Direct Server Response',
			};

			mockPterodactylApiRequest.mockResolvedValue(mockResponse);

			const result = await getServer.call(mockExecuteFunctions, 0);

			expect(result).toEqual(mockResponse);
		});

		it('should handle Application API response format', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('42');

			const applicationApiResponse = {
				object: 'server',
				attributes: {
					id: 42,
					external_id: null,
					uuid: '12345678-1234-1234-1234-123456789012',
					identifier: 'abc123def',
					name: 'Application Server',
					description: '',
					suspended: false,
					limits: {
						memory: 2048,
						swap: 0,
						disk: 10240,
						io: 500,
						cpu: 200,
					},
				},
			};

			mockPterodactylApiRequest.mockResolvedValue(applicationApiResponse);

			const result = await getServer.call(mockExecuteFunctions, 0);

			expect(result).toEqual(applicationApiResponse.attributes);
		});

		it('should handle Client API response format', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('abc123def');

			const clientApiResponse = {
				object: 'server',
				attributes: {
					server_owner: true,
					identifier: 'abc123def',
					internal_id: 42,
					uuid: '12345678-1234-1234-1234-123456789012',
					name: 'Client Server',
					node: 'node1',
					sftp_details: {
						ip: '127.0.0.1',
						port: 2022,
					},
					description: 'A client server',
					limits: {
						memory: 1024,
						swap: 0,
						disk: 5120,
						io: 500,
						cpu: 100,
					},
					invocation: 'java -Xms128M -Xmx1024M -jar server.jar',
					docker_image: 'ghcr.io/pterodactyl/yolks:java_17',
					egg_features: null,
					feature_limits: {
						databases: 1,
						allocations: 5,
						backups: 2,
					},
					status: null,
					is_suspended: false,
					is_installing: false,
					is_transferring: false,
				},
			};

			mockPterodactylApiRequest.mockResolvedValue(clientApiResponse);

			const result = await getServer.call(mockExecuteFunctions, 0);

			expect(result).toEqual(clientApiResponse.attributes);
		});

		it('should handle response with null attributes', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('server-id');

			mockPterodactylApiRequest.mockResolvedValue({
				object: 'server',
				attributes: null,
			});

			const result = await getServer.call(mockExecuteFunctions, 0);

			expect(result).toEqual({
				object: 'server',
				attributes: null,
			});
		});

		it('should handle response with undefined attributes', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('server-id');

			const mockResponse = { object: 'server' };
			mockPterodactylApiRequest.mockResolvedValue(mockResponse);

			const result = await getServer.call(mockExecuteFunctions, 0);

			expect(result).toEqual(mockResponse);
		});
	});

	describe('error handling', () => {
		it('should propagate errors from pterodactylApiRequest', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('server-123');

			const error = new Error('API request failed');
			mockPterodactylApiRequest.mockRejectedValue(error);

			await expect(getServer.call(mockExecuteFunctions, 0)).rejects.toThrow('API request failed');
		});

		it('should handle 404 not found error', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('nonexistent-server');

			const notFoundError = new Error(
				'Resource not found. Check server ID/identifier or endpoint URL.',
			);
			(notFoundError as any).statusCode = 404;
			mockPterodactylApiRequest.mockRejectedValue(notFoundError);

			await expect(getServer.call(mockExecuteFunctions, 0)).rejects.toThrow('Resource not found');
		});

		it('should handle authentication errors', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('server-123');

			const authError = new Error('API key invalid/expired');
			(authError as any).statusCode = 401;
			mockPterodactylApiRequest.mockRejectedValue(authError);

			await expect(getServer.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'API key invalid/expired',
			);
		});

		it('should handle permission errors', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('server-123');

			const permissionError = new Error(
				'Insufficient permissions, server suspended, or API key lacks access',
			);
			(permissionError as any).statusCode = 403;
			mockPterodactylApiRequest.mockRejectedValue(permissionError);

			await expect(getServer.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Insufficient permissions',
			);
		});

		it('should handle server errors', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('server-123');

			const serverError = new Error('Pterodactyl panel error. Check panel logs');
			(serverError as any).statusCode = 500;
			mockPterodactylApiRequest.mockRejectedValue(serverError);

			await expect(getServer.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Pterodactyl panel error',
			);
		});

		it('should handle network errors', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('server-123');

			const networkError = new Error('Network connection failed');
			mockPterodactylApiRequest.mockRejectedValue(networkError);

			await expect(getServer.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Network connection failed',
			);
		});

		it('should handle empty server ID', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('');

			mockPterodactylApiRequest.mockResolvedValue({});

			await getServer.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith('GET', '/servers/');
		});
	});

	describe('edge cases', () => {
		it('should handle very long server identifiers', async () => {
			const longId = 'a'.repeat(100);
			mockExecuteFunctions.getNodeParameter.mockReturnValue(longId);
			mockPterodactylApiRequest.mockResolvedValue({
				attributes: { identifier: longId },
			});

			await getServer.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith('GET', `/servers/${longId}`);
		});

		it('should handle server identifiers with URL-unsafe characters', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('server/with/slashes');
			mockPterodactylApiRequest.mockResolvedValue({});

			await getServer.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith('GET', '/servers/server/with/slashes');
		});

		it('should handle response with empty attributes object', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('server-123');

			mockPterodactylApiRequest.mockResolvedValue({
				object: 'server',
				attributes: {},
			});

			const result = await getServer.call(mockExecuteFunctions, 0);

			expect(result).toEqual({});
		});
	});
});
