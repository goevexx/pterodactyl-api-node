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
	itemIndex: number = 0,
): Promise<any> {
	const authentication = this.getNodeParameter('authentication', itemIndex) as string;
	const credentialType =
		authentication === 'clientApi' ? 'pterodactylClientApi' : 'pterodactylApplicationApi';
	const credentials = await this.getCredentials(credentialType, itemIndex);

	if (!credentials.panelUrl) {
		throw new Error('Panel URL is not configured in credentials. Please configure your Pterodactyl credentials in the node settings.');
	}

	if (!credentials.apiKey) {
		throw new Error('API Key is not configured in credentials');
	}

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
				let errorMessage = `Pterodactyl API Error [${pterodactylError.code}]: ${pterodactylError.detail}`;

				// Add helpful context for common errors
				if (error.statusCode === 409) {
					errorMessage += '\n\n💡 This usually means:\n';
					errorMessage += '• Server is suspended - unsuspend it first via Application API\n';
					errorMessage += '• Another power action is already in progress - wait for it to complete\n';
					errorMessage += '• Server state conflicts with the requested action';
				} else if (error.statusCode === 403) {
					errorMessage += '\n\n💡 This usually means:\n';
					errorMessage += '• Server is suspended - unsuspend it first via Application API\n';
					errorMessage += '• You lack permissions for this operation\n';
					errorMessage += '• Check your API key has the required access level';
				}

				throw new Error(errorMessage);
			}

			// Handle common HTTP status codes with user-friendly messages
			let errorMessage = error.message || 'Unknown error occurred';

			if (error.statusCode === 409) {
				errorMessage = `Conflict (409): ${errorMessage}\n\n💡 The server state conflicts with this action. Common causes:\n`;
				errorMessage += '• Server is suspended - unsuspend it first\n';
				errorMessage += '• Another power action is in progress - wait for it to complete';
			} else if (error.statusCode === 403) {
				errorMessage = `Forbidden (403): ${errorMessage}\n\n💡 Access denied. Common causes:\n`;
				errorMessage += '• Server is suspended\n';
				errorMessage += '• Insufficient permissions for this operation\n';
				errorMessage += '• API key lacks required access level';
			}

			// Create clean error without circular references
			const cleanError = new Error(errorMessage);
			cleanError.name = error.name || 'Error';
			cleanError.stack = error.stack; // Preserve stack trace for debugging
			if (error.statusCode) {
				(cleanError as any).statusCode = error.statusCode;
			}
			if (error.statusMessage) {
				(cleanError as any).statusMessage = error.statusMessage;
			}
			throw cleanError;
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
	itemIndex: number = 0,
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
			{
				...qs,
				page,
			},
			{},
			itemIndex,
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
