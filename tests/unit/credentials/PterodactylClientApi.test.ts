import { PterodactylClientApi } from '../../../credentials/PterodactylClientApi.credentials';

describe('PterodactylClientApi Credentials', () => {
	let credentials: PterodactylClientApi;

	beforeEach(() => {
		credentials = new PterodactylClientApi();
	});

	describe('credential metadata', () => {
		it('should have correct name', () => {
			expect(credentials.name).toBe('pterodactylClientApi');
		});

		it('should have correct display name', () => {
			expect(credentials.displayName).toBe('Pterodactyl Client API');
		});

		it('should have documentation URL', () => {
			expect(credentials.documentationUrl).toBe('https://pterodactyl.io/api/');
		});
	});

	describe('properties', () => {
		it('should have panelUrl property', () => {
			const panelUrlProp = credentials.properties.find((p) => p.name === 'panelUrl');
			expect(panelUrlProp).toBeDefined();
			expect(panelUrlProp?.displayName).toBe('Panel URL');
			expect(panelUrlProp?.type).toBe('string');
			expect(panelUrlProp?.required).toBe(true);
			expect(panelUrlProp?.placeholder).toBe('https://panel.example.com');
		});

		it('should have apiKey property', () => {
			const apiKeyProp = credentials.properties.find((p) => p.name === 'apiKey');
			expect(apiKeyProp).toBeDefined();
			expect(apiKeyProp?.displayName).toBe('API Key');
			expect(apiKeyProp?.type).toBe('string');
			expect(apiKeyProp?.required).toBe(true);
			expect(apiKeyProp?.typeOptions?.password).toBe(true);
		});

		it('should describe API key format (ptlc_ prefix)', () => {
			const apiKeyProp = credentials.properties.find((p) => p.name === 'apiKey');
			expect(apiKeyProp?.description).toContain('ptlc_');
		});
	});

	describe('authentication', () => {
		it('should be generic authentication type', () => {
			expect(credentials.authenticate.type).toBe('generic');
		});

		it('should set Authorization header with Bearer token', () => {
			const headers = credentials.authenticate.properties.headers as any;
			expect(headers?.Authorization).toBe('=Bearer {{$credentials.apiKey}}');
		});

		it('should set Accept header for Pterodactyl v1 API', () => {
			const headers = credentials.authenticate.properties.headers as any;
			expect(headers?.Accept).toBe('application/vnd.pterodactyl.v1+json');
		});

		it('should set Content-Type header to JSON', () => {
			const headers = credentials.authenticate.properties.headers as any;
			expect(headers?.['Content-Type']).toBe('application/json');
		});
	});

	describe('credential test request', () => {
		it('should use panelUrl as baseURL', () => {
			expect(credentials.test.request.baseURL).toBe('={{$credentials.panelUrl}}');
		});

		it('should test against /api/client endpoint', () => {
			expect(credentials.test.request.url).toBe('/api/client');
		});

		it('should use GET method', () => {
			expect(credentials.test.request.method).toBe('GET');
		});
	});
});
