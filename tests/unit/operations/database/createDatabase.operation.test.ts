import { createDatabase } from '../../../../nodes/Pterodactyl/actions/database/createDatabase.operation';
import { createMockExecuteFunctions } from '../../../helpers/mockExecuteFunctions';
import * as PterodactylApiRequest from '../../../../nodes/Pterodactyl/transport/PterodactylApiRequest';

jest.mock('../../../../nodes/Pterodactyl/transport/PterodactylApiRequest');

describe('createDatabase operation', () => {
	let mockExecuteFunctions: any;
	const mockPterodactylApiRequest =
		PterodactylApiRequest.pterodactylApiRequest as jest.MockedFunction<
			typeof PterodactylApiRequest.pterodactylApiRequest
		>;

	beforeEach(() => {
		mockExecuteFunctions = createMockExecuteFunctions();
		jest.clearAllMocks();
	});

	describe('credential validation', () => {
		it('should throw error if Client API credentials are not configured', async () => {
			mockExecuteFunctions.getCredentials.mockRejectedValue(new Error('No credentials'));

			await expect(createDatabase.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Create Database operation requires Client API credentials. Please configure and select Client API credentials.',
			);
		});

		it('should proceed if Client API credentials are configured', async () => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('my_database')
				.mockReturnValueOnce('%');
			mockPterodactylApiRequest.mockResolvedValue({});

			await createDatabase.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 0);
		});
	});

	describe('parameter handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue({});
		});

		it('should get all required parameters', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('my_database')
				.mockReturnValueOnce('%');

			await createDatabase.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('serverId', 0);
			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('database', 0);
			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('remote', 0);
		});
	});

	describe('API request', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue({});
		});

		it('should call pterodactylApiRequest with correct parameters', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('my_database')
				.mockReturnValueOnce('%');

			await createDatabase.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith('POST', '/servers/abc123/databases', {
				database: 'my_database',
				remote: '%',
			});
		});

		it('should use POST method', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('my_database')
				.mockReturnValueOnce('%');

			await createDatabase.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[0]).toBe('POST');
		});

		it('should construct endpoint with serverId', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('xyz789')
				.mockReturnValueOnce('test_db')
				.mockReturnValueOnce('127.0.0.1');

			await createDatabase.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[1]).toBe('/servers/xyz789/databases');
		});

		it('should handle % remote pattern (all access)', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('prod_db')
				.mockReturnValueOnce('%');

			await createDatabase.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[2]).toEqual({ database: 'prod_db', remote: '%' });
		});

		it('should handle localhost-only remote pattern', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('local_db')
				.mockReturnValueOnce('127.0.0.1');

			await createDatabase.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[2]).toEqual({ database: 'local_db', remote: '127.0.0.1' });
		});

		it('should handle IP range remote pattern', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('secure_db')
				.mockReturnValueOnce('192.168.1.%');

			await createDatabase.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[2]).toEqual({ database: 'secure_db', remote: '192.168.1.%' });
		});
	});

	describe('response handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
		});

		it('should return API response', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('my_database')
				.mockReturnValueOnce('%');

			const mockResponse = {
				object: 'database',
				attributes: {
					id: 'db-123',
					name: 's1_my_database',
					username: 'u1_dbuser',
					remote: '%',
				},
			};

			mockPterodactylApiRequest.mockResolvedValue(mockResponse);

			const result = await createDatabase.call(mockExecuteFunctions, 0);

			expect(result).toEqual(mockResponse);
		});

		it('should preserve all database attributes', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('test_db')
				.mockReturnValueOnce('127.0.0.1');

			const mockResponse = {
				attributes: {
					id: 'db-456',
					name: 's1_test_db',
					username: 'u1_testuser',
					remote: '127.0.0.1',
					host: 'mysql.example.com',
					port: 3306,
					password: 'auto-generated-password',
				},
			};

			mockPterodactylApiRequest.mockResolvedValue(mockResponse);

			const result = await createDatabase.call(mockExecuteFunctions, 0);

			expect(result.attributes).toHaveProperty('password');
			expect(result.attributes).toHaveProperty('host');
			expect(result.attributes).toHaveProperty('port');
		});
	});

	describe('error handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('abc123')
				.mockReturnValueOnce('my_database')
				.mockReturnValueOnce('%');
		});

		it('should propagate API request errors', async () => {
			const error = new Error('API request failed');
			mockPterodactylApiRequest.mockRejectedValue(error);

			await expect(createDatabase.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'API request failed',
			);
		});

		it('should handle database limit exceeded errors', async () => {
			const limitError = new Error('Database limit exceeded');
			(limitError as any).statusCode = 422;
			mockPterodactylApiRequest.mockRejectedValue(limitError);

			await expect(createDatabase.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Database limit exceeded',
			);
		});

		it('should handle invalid database name errors', async () => {
			const validationError = new Error('Invalid database name');
			(validationError as any).statusCode = 400;
			mockPterodactylApiRequest.mockRejectedValue(validationError);

			await expect(createDatabase.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Invalid database name',
			);
		});

		it('should handle duplicate database errors', async () => {
			const duplicateError = new Error('Database already exists');
			(duplicateError as any).statusCode = 409;
			mockPterodactylApiRequest.mockRejectedValue(duplicateError);

			await expect(createDatabase.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Database already exists',
			);
		});
	});
});
