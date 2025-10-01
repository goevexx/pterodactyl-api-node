import {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
} from 'n8n-workflow';

interface RateLimitState {
	requestCount: number;
	windowStart: number;
}

// Rate limit state storage per credential
const rateLimitState = new Map<string, RateLimitState>();

/**
 * Make authenticated HTTP request to Pterodactyl API with rate limiting and retry logic
 */
export async function pterodactylApiRequest(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	option: IDataObject = {},
): Promise<any> {
	const authentication = this.getNodeParameter('authentication', 0) as string;
	const credentialType =
		authentication === 'clientApi' ? 'pterodactylClientApi' : 'pterodactylApplicationApi';
	const credentials = await this.getCredentials(credentialType);

	const panelUrl = (credentials.panelUrl as string).replace(/\/$/, '');
	const apiBase = authentication === 'clientApi' ? '/api/client' : '/api/application';

	const options: IHttpRequestOptions = {
		method,
		url: `${panelUrl}${apiBase}${endpoint}`,
		headers: {
			Authorization: `Bearer ${credentials.apiKey}`,
			Accept: 'application/vnd.pterodactyl.v1+json',
			'Content-Type': 'application/json',
		},
		qs,
		body,
		json: true,
		returnFullResponse: false,
		...option,
	};

	// Rate limiting check
	const credentialKey = `${panelUrl}-${credentials.apiKey}`;
	const now = Date.now();
	const windowDuration = 60000; // 1 minute
	const maxRequests = authentication === 'clientApi' ? 720 : 240;

	let limitState = rateLimitState.get(credentialKey);
	if (!limitState || now - limitState.windowStart > windowDuration) {
		limitState = { requestCount: 0, windowStart: now };
		rateLimitState.set(credentialKey, limitState);
	}

	if (limitState.requestCount >= maxRequests) {
		const waitTime = windowDuration - (now - limitState.windowStart);
		await new Promise((resolve) => setTimeout(resolve, waitTime));
		limitState.requestCount = 0;
		limitState.windowStart = Date.now();
	}

	limitState.requestCount++;

	// Retry logic for 429 errors with exponential backoff
	let retries = 0;
	const maxRetries = 5;
	const baseDelay = 5000;

	while (retries <= maxRetries) {
		try {
			return await this.helpers.httpRequest(options);
		} catch (error: any) {
			if (error.statusCode === 429 && retries < maxRetries) {
				const delay = baseDelay * Math.pow(2, retries);
				await new Promise((resolve) => setTimeout(resolve, delay));
				retries++;
				continue;
			}

			// Parse Pterodactyl error format
			if (error.response?.body?.errors) {
				const pterodactylError = error.response.body.errors[0];
				const errorMessage = `Pterodactyl API Error [${pterodactylError.code}]: ${pterodactylError.detail}`;
				throw new Error(errorMessage);
			}

			throw error;
		}
	}

	throw new Error('Max retries exceeded for rate-limited request');
}

/**
 * Make request to Pterodactyl API and return all items from paginated response
 */
export async function pterodactylApiRequestAllItems(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<any[]> {
	let page = 1;
	let hasMorePages = true;
	const allItems: any[] = [];

	while (hasMorePages) {
		const response = await pterodactylApiRequest.call(
			this,
			method,
			endpoint,
			body,
			{ ...qs, page },
		);

		// Handle paginated response
		if (response.data) {
			allItems.push(...response.data);
		}

		// Check if there are more pages
		if (response.meta?.pagination) {
			hasMorePages = page < response.meta.pagination.total_pages;
			page++;
		} else {
			hasMorePages = false;
		}
	}

	return allItems;
}
