import { pterodactylApiRequest } from '../../../nodes/Pterodactyl/transport/PterodactylApiRequest';
import { createMockExecuteFunctions } from '../../helpers/mockExecuteFunctions';
import { createMockHttpResponse } from '../../helpers/mockHttpRequest';
import {
	testClientCredentials,
	testApplicationCredentials,
	testClientCredentialsWithTrailingSlash,
} from '../../fixtures/testCredentials';

describe('pterodactylApiRequest', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = createMockExecuteFunctions();
	});

	describe('authentication and credential handling', () => {
		it('should use clientApi credentials when authentication is clientApi', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('clientApi');
			mockExecuteFunctions.getCredentials.mockResolvedValue(testClientCredentials);
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(
				createMockHttpResponse({ data: 'test' }),
			);

			await pterodactylApiRequest.call(mockExecuteFunctions, 'GET', '/servers', {}, {}, {}, 0);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 0);
		});

		it('should use applicationApi credentials when authentication is applicationApi', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('applicationApi');
			mockExecuteFunctions.getCredentials.mockResolvedValue(testApplicationCredentials);
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(
				createMockHttpResponse({ data: 'test' }),
			);

			await pterodactylApiRequest.call(mockExecuteFunctions, 'GET', '/servers', {}, {}, {}, 0);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith(
				'pterodactylApplicationApi',
				0,
			);
		});

		it('should throw error when panelUrl is missing', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('clientApi');
			mockExecuteFunctions.getCredentials.mockResolvedValue({ panelUrl: '', apiKey: 'test' });

			await expect(
				pterodactylApiRequest.call(mockExecuteFunctions, 'GET', '/servers', {}, {}, {}, 0),
			).rejects.toThrow('Panel URL is not configured');
		});

		it('should throw error when apiKey is missing', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('clientApi');
			mockExecuteFunctions.getCredentials.mockResolvedValue({
				panelUrl: 'https://panel.example.com',
				apiKey: '',
			});

			await expect(
				pterodactylApiRequest.call(mockExecuteFunctions, 'GET', '/servers', {}, {}, {}, 0),
			).rejects.toThrow('API Key is not configured');
		});
	});

	describe('request construction', () => {
		beforeEach(() => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('clientApi');
			mockExecuteFunctions.getCredentials.mockResolvedValue(testClientCredentials);
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(
				createMockHttpResponse({ data: 'test' }),
			);
		});

		it('should remove trailing slash from panelUrl', async () => {
			mockExecuteFunctions.getCredentials.mockResolvedValue(testClientCredentialsWithTrailingSlash);

			await pterodactylApiRequest.call(mockExecuteFunctions, 'GET', '/servers', {}, {}, {}, 0);

			const callArgs = mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0];
			expect(callArgs.url).toBe('https://panel.example.com/api/client/servers');
			expect(callArgs.url).not.toContain('//servers');
		});

		it('should use /api/client for client authentication', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('clientApi');

			await pterodactylApiRequest.call(mockExecuteFunctions, 'GET', '/servers', {}, {}, {}, 0);

			const callArgs = mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0];
			expect(callArgs.url).toContain('/api/client/servers');
		});

		it('should use /api/application for application authentication', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('applicationApi');
			mockExecuteFunctions.getCredentials.mockResolvedValue(testApplicationCredentials);

			await pterodactylApiRequest.call(mockExecuteFunctions, 'GET', '/servers', {}, {}, {}, 0);

			const callArgs = mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0];
			expect(callArgs.url).toContain('/api/application/servers');
		});

		it('should set correct Authorization header', async () => {
			await pterodactylApiRequest.call(mockExecuteFunctions, 'GET', '/servers', {}, {}, {}, 0);

			const callArgs = mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0];
			expect(callArgs.headers.Authorization).toBe(`Bearer ${testClientCredentials.apiKey}`);
		});

		it('should set Accept and Content-Type headers', async () => {
			await pterodactylApiRequest.call(mockExecuteFunctions, 'GET', '/servers', {}, {}, {}, 0);

			const callArgs = mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0];
			expect(callArgs.headers.Accept).toBe('application/vnd.pterodactyl.v1+json');
			expect(callArgs.headers['Content-Type']).toBe('application/json');
		});

		it('should include query string parameters', async () => {
			const queryParams = { page: 1, per_page: 50 };

			await pterodactylApiRequest.call(
				mockExecuteFunctions,
				'GET',
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
			const requestBody = { name: 'Test Server' };

			await pterodactylApiRequest.call(
				mockExecuteFunctions,
				'POST',
				'/servers',
				requestBody,
				{},
				{},
				0,
			);

			const callArgs = mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0];
			expect(callArgs.body).toEqual(requestBody);
		});

		it('should set returnFullResponse to true', async () => {
			await pterodactylApiRequest.call(mockExecuteFunctions, 'GET', '/servers', {}, {}, {}, 0);

			const callArgs = mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0];
			expect(callArgs.returnFullResponse).toBe(true);
		});

		it('should set ignoreHttpStatusErrors to true', async () => {
			await pterodactylApiRequest.call(mockExecuteFunctions, 'GET', '/servers', {}, {}, {}, 0);

			const callArgs = mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0];
			expect(callArgs.ignoreHttpStatusErrors).toBe(true);
		});
	});

	describe('error handling - Pterodactyl error format', () => {
		beforeEach(() => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('clientApi');
			mockExecuteFunctions.getCredentials.mockResolvedValue(testClientCredentials);
		});

		it('should parse Pterodactyl error format from response body', async () => {
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 404,
				body: {
					errors: [
						{
							code: 'ResourceNotFoundException',
							status: '404',
							detail: 'Server not found',
						},
					],
				},
			});

			await expect(
				pterodactylApiRequest.call(mockExecuteFunctions, 'GET', '/servers/xyz', {}, {}, {}, 0),
			).rejects.toThrow('Pterodactyl API Error [ResourceNotFoundException]: Server not found');
		});

		it('should enhance 404 error message', async () => {
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 404,
				body: {
					errors: [
						{
							code: 'ResourceNotFoundException',
							status: '404',
							detail: 'Server not found',
						},
					],
				},
			});

			await expect(
				pterodactylApiRequest.call(mockExecuteFunctions, 'GET', '/servers/xyz', {}, {}, {}, 0),
			).rejects.toThrow('Resource not found. Check server ID/identifier or endpoint URL.');
		});

		it('should enhance 403 error message', async () => {
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 403,
				statusMessage: 'Forbidden',
				body: {},
			});

			await expect(
				pterodactylApiRequest.call(mockExecuteFunctions, 'GET', '/servers', {}, {}, {}, 0),
			).rejects.toThrow('Insufficient permissions, server suspended, or API key lacks access');
		});

		it('should enhance 429 rate limit error message', async () => {
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 429,
				statusMessage: 'Too Many Requests',
				body: {},
			});

			await expect(
				pterodactylApiRequest.call(mockExecuteFunctions, 'GET', '/servers', {}, {}, {}, 0),
			).rejects.toThrow('Rate limit exceeded');
		});

		it('should enhance 401 error message', async () => {
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 401,
				statusMessage: 'Unauthorized',
				body: {},
			});

			await expect(
				pterodactylApiRequest.call(mockExecuteFunctions, 'GET', '/servers', {}, {}, {}, 0),
			).rejects.toThrow('API key invalid/expired');
		});

		it('should enhance 422 validation error message', async () => {
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 422,
				statusMessage: 'Unprocessable Entity',
				body: {},
			});

			await expect(
				pterodactylApiRequest.call(mockExecuteFunctions, 'POST', '/servers', {}, {}, {}, 0),
			).rejects.toThrow('Validation error. Check input parameters');
		});

		it('should enhance 500 server error message', async () => {
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 500,
				statusMessage: 'Internal Server Error',
				body: {},
			});

			await expect(
				pterodactylApiRequest.call(mockExecuteFunctions, 'GET', '/servers', {}, {}, {}, 0),
			).rejects.toThrow('Pterodactyl panel error. Check panel logs');
		});

		it('should enhance 502 Wings daemon error message', async () => {
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 502,
				statusMessage: 'Bad Gateway',
				body: {},
			});

			await expect(
				pterodactylApiRequest.call(mockExecuteFunctions, 'GET', '/servers', {}, {}, {}, 0),
			).rejects.toThrow('Wings daemon down/unreachable');
		});

		it('should enhance 409 conflict error message', async () => {
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 409,
				statusMessage: 'Conflict',
				body: {},
			});

			await expect(
				pterodactylApiRequest.call(mockExecuteFunctions, 'POST', '/power', {}, {}, {}, 0),
			).rejects.toThrow('Server suspended, power action in progress, or would exceed disk limits');
		});

		it('should handle error without statusMessage', async () => {
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 503,
				body: {},
			});

			await expect(
				pterodactylApiRequest.call(mockExecuteFunctions, 'GET', '/servers', {}, {}, {}, 0),
			).rejects.toThrow('HTTP 503 error');
		});
	});

	describe('error handling - exception path', () => {
		beforeEach(() => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('clientApi');
			mockExecuteFunctions.getCredentials.mockResolvedValue(testClientCredentials);
		});

		it('should handle Pterodactyl error format from error.response', async () => {
			const error = new Error('Request failed');
			(error as any).response = {
				body: {
					errors: [
						{
							code: 'ValidationException',
							status: '422',
							detail: 'Invalid input',
						},
					],
				},
			};
			(error as any).statusCode = 422;
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

			await expect(
				pterodactylApiRequest.call(mockExecuteFunctions, 'POST', '/servers', {}, {}, {}, 0),
			).rejects.toThrow('Pterodactyl API Error [ValidationException]: Invalid input');
		});

		it('should create clean errors without circular references', async () => {
			const error = new Error('Network error');
			(error as any).statusCode = 500;
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

			await expect(
				pterodactylApiRequest.call(mockExecuteFunctions, 'GET', '/servers', {}, {}, {}, 0),
			).rejects.toThrow('Network error');
		});

		it('should preserve statusCode in thrown error', async () => {
			const error = new Error('Server error');
			(error as any).statusCode = 503;
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

			try {
				await pterodactylApiRequest.call(mockExecuteFunctions, 'GET', '/servers', {}, {}, {}, 0);
				fail('Should have thrown error');
			} catch (e: any) {
				expect(e.statusCode).toBe(503);
			}
		});

		it('should preserve error name and stack', async () => {
			const error = new Error('Custom error');
			error.name = 'CustomError';
			error.stack = 'Custom stack trace';
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

			try {
				await pterodactylApiRequest.call(mockExecuteFunctions, 'GET', '/servers', {}, {}, {}, 0);
				fail('Should have thrown error');
			} catch (e: any) {
				expect(e.name).toBe('CustomError');
				expect(e.stack).toBe('Custom stack trace');
			}
		});

		it('should handle error without message', async () => {
			const error: any = {};
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(error);

			await expect(
				pterodactylApiRequest.call(mockExecuteFunctions, 'GET', '/servers', {}, {}, {}, 0),
			).rejects.toThrow('Unknown error occurred');
		});
	});

	describe('successful responses', () => {
		beforeEach(() => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('clientApi');
			mockExecuteFunctions.getCredentials.mockResolvedValue(testClientCredentials);
		});

		it('should return response body for 200 OK', async () => {
			const responseBody = { data: [{ id: 1, name: 'Server 1' }] };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 200,
				body: responseBody,
			});

			const result = await pterodactylApiRequest.call(
				mockExecuteFunctions,
				'GET',
				'/servers',
				{},
				{},
				{},
				0,
			);

			expect(result).toEqual(responseBody);
		});

		it('should return response body for 201 Created', async () => {
			const responseBody = { object: 'server', attributes: { id: 1 } };
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 201,
				body: responseBody,
			});

			const result = await pterodactylApiRequest.call(
				mockExecuteFunctions,
				'POST',
				'/servers',
				{},
				{},
				{},
				0,
			);

			expect(result).toEqual(responseBody);
		});

		it('should return response body for 204 No Content', async () => {
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				statusCode: 204,
				body: '',
			});

			const result = await pterodactylApiRequest.call(
				mockExecuteFunctions,
				'DELETE',
				'/servers/1',
				{},
				{},
				{},
				0,
			);

			expect(result).toBe('');
		});
	});
});
