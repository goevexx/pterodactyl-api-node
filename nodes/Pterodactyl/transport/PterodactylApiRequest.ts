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
		returnFullResponse: true, // Need full response to access status codes
		ignoreHttpStatusErrors: true, // Don't throw on non-2xx status codes
		...option,
	};

	// Rate limiting check
	const credentialKey = `${panelUrl}-${credentials.apiKey}`;
	const now = Date.now();
	const windowDuration = 60000; // 1 minute
	// Default rate limit is 240/min for both APIs (configurable via APP_API_CLIENT_RATELIMIT and APP_API_APPLICATION_RATELIMIT)
	const maxRequests = 240;

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
			const response = await this.helpers.httpRequest(options);

			// Check for error status codes when ignoreHttpStatusErrors is true
			if (response.statusCode && response.statusCode >= 400) {
				// Handle 429 with retry logic
				if (response.statusCode === 429 && retries < maxRetries) {
					const delay = baseDelay * Math.pow(2, retries);
					await new Promise((resolve) => setTimeout(resolve, delay));
					retries++;
					continue;
				}

				// Parse Pterodactyl error format
				if (response.body?.errors) {
					const pterodactylError = response.body.errors[0];
					let errorMessage = `Pterodactyl API Error [${pterodactylError.code}]: ${pterodactylError.detail}`;

				// Add helpful context for common errors
				if (response.statusCode === 401) {
					errorMessage += '<br><br>💡 This usually means:<br>';
					errorMessage += '• API key is invalid or expired<br>';
					errorMessage += '• Check your credentials configuration in n8n';
				} else if (response.statusCode === 403) {
					errorMessage += '<br><br>💡 This usually means:<br>';
					errorMessage += '• Insufficient permissions for this operation<br>';
					errorMessage += '• Server is suspended (use Application API to unsuspend)<br>';
					errorMessage += '• API key lacks required access level';
				} else if (response.statusCode === 404) {
					errorMessage += '<br><br>💡 This usually means:<br>';
					errorMessage += '• Resource does not exist (check server ID, file path, etc.)<br>';
					errorMessage += '• Endpoint URL may be incorrect';
				} else if (response.statusCode === 409) {
					errorMessage += '<br><br>💡 This usually means:<br>';
					errorMessage += '• Server is suspended - unsuspend it first using Application API<br>';
					errorMessage += '• Another power action is already in progress - wait a moment and try again<br>';
					errorMessage += '• Operation would exceed disk space limits (for file operations)';
				} else if (response.statusCode === 422) {
					errorMessage += '<br><br>💡 This usually means:<br>';
					errorMessage += '• Validation failed - check your input parameters<br>';
					errorMessage += '• Required fields may be missing or invalid';
				} else if (response.statusCode === 500) {
					errorMessage += '<br><br>💡 This usually means:<br>';
					errorMessage += '• Server encountered an internal error<br>';
					errorMessage += '• Check Pterodactyl panel logs for details';
				} else if (response.statusCode === 502) {
					errorMessage += '<br><br>💡 This usually means:<br>';
					errorMessage += '• Wings daemon is down or unreachable<br>';
					errorMessage += '• Check Wings service status on the node';
				}

					throw new Error(errorMessage);
				}

				// Handle common HTTP status codes with user-friendly messages
				let errorMessage = response.statusMessage || `HTTP ${response.statusCode} error`;

				if (response.statusCode === 401) {
					errorMessage = `Unauthorized (401): ${errorMessage}<br><br>💡 Authentication failed:<br>`;
					errorMessage += '• API key is invalid or expired<br>';
					errorMessage += '• Check your credentials configuration';
				} else if (response.statusCode === 403) {
					errorMessage = `Forbidden (403): ${errorMessage}<br><br>💡 Access denied:<br>`;
					errorMessage += '• Insufficient permissions for this operation<br>';
					errorMessage += '• Server may be suspended<br>';
					errorMessage += '• API key lacks required access level';
				} else if (response.statusCode === 404) {
					errorMessage = `Not Found (404): ${errorMessage}<br><br>💡 Resource not found:<br>`;
					errorMessage += '• Check server ID, file path, or resource identifier<br>';
					errorMessage += '• Endpoint URL may be incorrect';
				} else if (response.statusCode === 409) {
					errorMessage = `Conflict (409): ${errorMessage}<br><br>💡 State conflict:<br>`;
					errorMessage += '• Server is suspended - unsuspend it first using Application API<br>';
					errorMessage += '• Another power action is in progress - wait a moment and try again<br>';
					errorMessage += '• Operation would exceed resource limits';
				} else if (response.statusCode === 422) {
					errorMessage = `Validation Error (422): ${errorMessage}<br><br>💡 Invalid input:<br>`;
					errorMessage += '• Check your input parameters<br>';
					errorMessage += '• Required fields may be missing or invalid';
				} else if (response.statusCode === 500) {
					errorMessage = `Internal Server Error (500): ${errorMessage}<br><br>💡 Server error:<br>`;
					errorMessage += '• Pterodactyl panel encountered an error<br>';
					errorMessage += '• Check panel logs for details';
				} else if (response.statusCode === 502) {
					errorMessage = `Bad Gateway (502): ${errorMessage}<br><br>💡 Service unavailable:<br>`;
					errorMessage += '• Wings daemon is down or unreachable<br>';
					errorMessage += '• Check Wings service status';
				}

				const error = new Error(errorMessage);
				(error as any).statusCode = response.statusCode;
				throw error;
			}

			// Return body for successful responses
			return response.body;
		} catch (error: any) {
			// Re-throw if it's already our formatted error
			if (error.message?.includes('💡')) {
				throw error;
			}

			// Handle legacy error format (fallback for network errors, etc.)
			if (error.statusCode === 429 && retries < maxRetries) {
				const delay = baseDelay * Math.pow(2, retries);
				await new Promise((resolve) => setTimeout(resolve, delay));
				retries++;
				continue;
			}

			// Parse Pterodactyl error format from error.response
			if (error.response?.body?.errors) {
				const pterodactylError = error.response.body.errors[0];
				let errorMessage = `Pterodactyl API Error [${pterodactylError.code}]: ${pterodactylError.detail}`;

				if (error.statusCode === 401) {
					errorMessage += '<br><br>💡 This usually means:<br>';
					errorMessage += '• API key is invalid or expired<br>';
					errorMessage += '• Check your credentials configuration in n8n';
				} else if (error.statusCode === 403) {
					errorMessage += '<br><br>💡 This usually means:<br>';
					errorMessage += '• Insufficient permissions for this operation<br>';
					errorMessage += '• Server is suspended (use Application API to unsuspend)<br>';
					errorMessage += '• API key lacks required access level';
				} else if (error.statusCode === 404) {
					errorMessage += '<br><br>💡 This usually means:<br>';
					errorMessage += '• Resource does not exist (check server ID, file path, etc.)<br>';
					errorMessage += '• Endpoint URL may be incorrect';
				} else if (error.statusCode === 409) {
					errorMessage += '<br><br>💡 This usually means:<br>';
					errorMessage += '• Server is suspended - unsuspend it first using Application API<br>';
					errorMessage += '• Another power action is already in progress - wait a moment and try again<br>';
					errorMessage += '• Operation would exceed disk space limits (for file operations)';
				} else if (error.statusCode === 422) {
					errorMessage += '<br><br>💡 This usually means:<br>';
					errorMessage += '• Validation failed - check your input parameters<br>';
					errorMessage += '• Required fields may be missing or invalid';
				} else if (error.statusCode === 500) {
					errorMessage += '<br><br>💡 This usually means:<br>';
					errorMessage += '• Server encountered an internal error<br>';
					errorMessage += '• Check Pterodactyl panel logs for details';
				} else if (error.statusCode === 502) {
					errorMessage += '<br><br>💡 This usually means:<br>';
					errorMessage += '• Wings daemon is down or unreachable<br>';
					errorMessage += '• Check Wings service status on the node';
				}

				throw new Error(errorMessage);
			}

			// Create clean error without circular references
			const cleanError = new Error(error.message || 'Unknown error occurred');
			cleanError.name = error.name || 'Error';
			cleanError.stack = error.stack;
			if (error.statusCode) {
				(cleanError as any).statusCode = error.statusCode;
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
