import { pterodactylApiRequest } from '../../../../shared/transport/PterodactylApiRequest';
import { createMockExecuteFunctions } from '../../../helpers/mockExecuteFunctions';

describe('Shared Transport - pterodactylApiRequest', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = createMockExecuteFunctions();
	});

	describe('Dynamic credential selection based on apiBase', () => {
		it('should use pterodactylClientApi credentials when apiBase is /api/client', async () => {
			const clientCredentials = {
				panelUrl: 'https://panel.example.com',
				apiKey: 'ptlc_test_client_key',
			};
			mockExecuteFunctions.getCredentials.mockResolvedValue(clientCredentials);
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 200,
				body: { data: [] },
			});

			await pterodactylApiRequest.call(
				mockExecuteFunctions,
				'GET',
				'/api/client',
				'/servers',
				{},
				{},
				{},
				0,
			);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 0);
		});

		it('should use pterodactylApplicationApi credentials when apiBase is /api/application', async () => {
			const appCredentials = {
				panelUrl: 'https://panel.example.com',
				apiKey: 'ptla_test_app_key',
			};
			mockExecuteFunctions.getCredentials.mockResolvedValue(appCredentials);
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 200,
				body: { data: [] },
			});

			await pterodactylApiRequest.call(
				mockExecuteFunctions,
				'GET',
				'/api/application',
				'/users',
				{},
				{},
				{},
				0,
			);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith(
				'pterodactylApplicationApi',
				0,
			);
		});

		it('should throw helpful error when Client API credentials are missing', async () => {
			mockExecuteFunctions.getCredentials.mockRejectedValue(new Error('Credentials not found'));

			await expect(
				pterodactylApiRequest.call(
					mockExecuteFunctions,
					'GET',
					'/api/client',
					'/servers',
					{},
					{},
					{},
					0,
				),
			).rejects.toThrow(
				'Client API credentials not configured. Please add the credentials in node settings.',
			);
		});

		it('should throw helpful error when Application API credentials are missing', async () => {
			mockExecuteFunctions.getCredentials.mockRejectedValue(new Error('Credentials not found'));

			await expect(
				pterodactylApiRequest.call(
					mockExecuteFunctions,
					'GET',
					'/api/application',
					'/users',
					{},
					{},
					{},
					0,
				),
			).rejects.toThrow(
				'Application API credentials not configured. Please add the credentials in node settings.',
			);
		});
	});

	describe('Request URL construction with apiBase', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({
				panelUrl: 'https://panel.example.com',
				apiKey: 'test_key',
			});
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 200,
				body: {},
			});
		});

		it('should construct correct URL for Client API', async () => {
			await pterodactylApiRequest.call(
				mockExecuteFunctions,
				'GET',
				'/api/client',
				'/servers/abc123',
				{},
				{},
				{},
				0,
			);

			const callArgs = mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0];
			expect(callArgs.url).toBe('https://panel.example.com/api/client/servers/abc123');
		});

		it('should construct correct URL for Application API', async () => {
			await pterodactylApiRequest.call(
				mockExecuteFunctions,
				'GET',
				'/api/application',
				'/users',
				{},
				{},
				{},
				0,
			);

			const callArgs = mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0];
			expect(callArgs.url).toBe('https://panel.example.com/api/application/users');
		});

		it('should handle trailing slash in panelUrl', async () => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({
				panelUrl: 'https://panel.example.com/',
				apiKey: 'test_key',
			});

			await pterodactylApiRequest.call(
				mockExecuteFunctions,
				'GET',
				'/api/client',
				'/servers',
				{},
				{},
				{},
				0,
			);

			const callArgs = mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0];
			expect(callArgs.url).toBe('https://panel.example.com/api/client/servers');
			expect(callArgs.url).not.toContain('//api');
		});

		it('should handle empty endpoint', async () => {
			await pterodactylApiRequest.call(
				mockExecuteFunctions,
				'GET',
				'/api/client',
				'',
				{},
				{},
				{},
				0,
			);

			const callArgs = mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0];
			expect(callArgs.url).toBe('https://panel.example.com/api/client');
		});
	});

	describe('Credential validation', () => {
		it('should throw error when panelUrl is missing', async () => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({
				panelUrl: '',
				apiKey: 'test_key',
			});

			await expect(
				pterodactylApiRequest.call(
					mockExecuteFunctions,
					'GET',
					'/api/client',
					'/servers',
					{},
					{},
					{},
					0,
				),
			).rejects.toThrow(
				'Panel URL is not configured in credentials. Please configure your Pterodactyl credentials in the node settings.',
			);
		});

		it('should throw error when apiKey is missing', async () => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({
				panelUrl: 'https://panel.example.com',
				apiKey: '',
			});

			await expect(
				pterodactylApiRequest.call(
					mockExecuteFunctions,
					'GET',
					'/api/client',
					'/servers',
					{},
					{},
					{},
					0,
				),
			).rejects.toThrow('API Key is not configured in credentials');
		});
	});

	describe('HTTP headers', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({
				panelUrl: 'https://panel.example.com',
				apiKey: 'test_key_123',
			});
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 200,
				body: {},
			});
		});

		it('should set correct Authorization header', async () => {
			await pterodactylApiRequest.call(
				mockExecuteFunctions,
				'GET',
				'/api/client',
				'/servers',
				{},
				{},
				{},
				0,
			);

			const callArgs = mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0];
			expect(callArgs.headers.Authorization).toBe('Bearer test_key_123');
		});

		it('should set Pterodactyl Accept header', async () => {
			await pterodactylApiRequest.call(
				mockExecuteFunctions,
				'GET',
				'/api/client',
				'/servers',
				{},
				{},
				{},
				0,
			);

			const callArgs = mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0];
			expect(callArgs.headers.Accept).toBe('application/vnd.pterodactyl.v1+json');
		});

		it('should set Content-Type header', async () => {
			await pterodactylApiRequest.call(
				mockExecuteFunctions,
				'POST',
				'/api/client',
				'/servers/abc/backups',
				{},
				{},
				{},
				0,
			);

			const callArgs = mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0];
			expect(callArgs.headers['Content-Type']).toBe('application/json');
		});

		it('should merge custom headers', async () => {
			await pterodactylApiRequest.call(
				mockExecuteFunctions,
				'GET',
				'/api/client',
				'/servers',
				{},
				{},
				{ headers: { 'X-Custom-Header': 'test' } },
				0,
			);

			const callArgs = mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0];
			expect(callArgs.headers['X-Custom-Header']).toBe('test');
			expect(callArgs.headers.Authorization).toBe('Bearer test_key_123');
		});
	});

	describe('Request parameters', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({
				panelUrl: 'https://panel.example.com',
				apiKey: 'test_key',
			});
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 200,
				body: {},
			});
		});

		it('should include query string parameters', async () => {
			const queryParams = { page: 2, per_page: 50 };

			await pterodactylApiRequest.call(
				mockExecuteFunctions,
				'GET',
				'/api/client',
				'/servers',
				{},
				queryParams,
				{},
				0,
			);

			const callArgs = mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0];
			expect(callArgs.qs).toEqual(queryParams);
		});

		it('should include request body', async () => {
			const body = { name: 'Test Backup', is_locked: false };

			await pterodactylApiRequest.call(
				mockExecuteFunctions,
				'POST',
				'/api/client',
				'/servers/abc/backups',
				body,
				{},
				{},
				0,
			);

			const callArgs = mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0];
			expect(callArgs.body).toEqual(body);
		});

		it('should set json flag to true', async () => {
			await pterodactylApiRequest.call(
				mockExecuteFunctions,
				'GET',
				'/api/client',
				'/servers',
				{},
				{},
				{},
				0,
			);

			const callArgs = mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0];
			expect(callArgs.json).toBe(true);
		});

		it('should set returnFullResponse to true', async () => {
			await pterodactylApiRequest.call(
				mockExecuteFunctions,
				'GET',
				'/api/client',
				'/servers',
				{},
				{},
				{},
				0,
			);

			const callArgs = mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0];
			expect(callArgs.returnFullResponse).toBe(true);
		});

		it('should set ignoreHttpStatusErrors to true', async () => {
			await pterodactylApiRequest.call(
				mockExecuteFunctions,
				'GET',
				'/api/client',
				'/servers',
				{},
				{},
				{},
				0,
			);

			const callArgs = mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0];
			expect(callArgs.ignoreHttpStatusErrors).toBe(true);
		});
	});

	describe('Success responses', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({
				panelUrl: 'https://panel.example.com',
				apiKey: 'test_key',
			});
		});

		it('should return body for 200 OK', async () => {
			const responseBody = { data: [{ id: 1, name: 'Server 1' }] };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 200,
				body: responseBody,
			});

			const result = await pterodactylApiRequest.call(
				mockExecuteFunctions,
				'GET',
				'/api/client',
				'/servers',
				{},
				{},
				{},
				0,
			);

			expect(result).toEqual(responseBody);
		});

		it('should return body for 201 Created', async () => {
			const responseBody = { object: 'backup', attributes: { uuid: 'abc123' } };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 201,
				body: responseBody,
			});

			const result = await pterodactylApiRequest.call(
				mockExecuteFunctions,
				'POST',
				'/api/application',
				'/servers',
				{},
				{},
				{},
				0,
			);

			expect(result).toEqual(responseBody);
		});

		it('should handle 204 No Content', async () => {
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 204,
				body: '',
			});

			const result = await pterodactylApiRequest.call(
				mockExecuteFunctions,
				'DELETE',
				'/api/client',
				'/servers/abc/backups/123',
				{},
				{},
				{},
				0,
			);

			expect(result).toBe('');
		});
	});

	describe('Error handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({
				panelUrl: 'https://panel.example.com',
				apiKey: 'test_key',
			});
		});

		it('should parse Pterodactyl error format', async () => {
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 404,
				body: {
					errors: [
						{
							code: 'ResourceNotFoundException',
							status: '404',
							detail: 'The requested server could not be found',
						},
					],
				},
			});

			await expect(
				pterodactylApiRequest.call(
					mockExecuteFunctions,
					'GET',
					'/api/client',
					'/servers/invalid',
					{},
					{},
					{},
					0,
				),
			).rejects.toThrow(
				'Pterodactyl API Error [ResourceNotFoundException]: The requested server could not be found',
			);
		});

		it('should enhance 401 Unauthorized errors', async () => {
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 401,
				statusMessage: 'Unauthorized',
				body: {},
			});

			await expect(
				pterodactylApiRequest.call(
					mockExecuteFunctions,
					'GET',
					'/api/client',
					'/servers',
					{},
					{},
					{},
					0,
				),
			).rejects.toThrow('API key invalid/expired. Check n8n credentials.');
		});

		it('should enhance 403 Forbidden errors', async () => {
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 403,
				statusMessage: 'Forbidden',
				body: {},
			});

			await expect(
				pterodactylApiRequest.call(
					mockExecuteFunctions,
					'POST',
					'/api/client',
					'/servers/abc/power',
					{},
					{},
					{},
					0,
				),
			).rejects.toThrow(
				'Insufficient permissions, server suspended, or API key lacks access.',
			);
		});

		it('should enhance 404 Not Found errors', async () => {
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 404,
				statusMessage: 'Not Found',
				body: {},
			});

			await expect(
				pterodactylApiRequest.call(
					mockExecuteFunctions,
					'GET',
					'/api/client',
					'/servers/nonexistent',
					{},
					{},
					{},
					0,
				),
			).rejects.toThrow('Resource not found. Check server ID/identifier or endpoint URL.');
		});

		it('should enhance 422 Validation errors', async () => {
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 422,
				statusMessage: 'Unprocessable Entity',
				body: {},
			});

			await expect(
				pterodactylApiRequest.call(
					mockExecuteFunctions,
					'POST',
					'/api/application',
					'/users',
					{},
					{},
					{},
					0,
				),
			).rejects.toThrow('Validation error. Check input parameters.');
		});

		it('should enhance 429 Rate Limit errors', async () => {
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 429,
				statusMessage: 'Too Many Requests',
				body: {},
			});

			await expect(
				pterodactylApiRequest.call(
					mockExecuteFunctions,
					'GET',
					'/api/client',
					'/servers',
					{},
					{},
					{},
					0,
				),
			).rejects.toThrow(
				'Rate limit exceeded. Enable "Retry On Fail" in node settings (5 tries, 5000ms wait).',
			);
		});
	});
});
