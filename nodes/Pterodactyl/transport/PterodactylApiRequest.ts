import {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
} from 'n8n-workflow';

/**
 * Enhance error message with helpful context based on HTTP status code
 */
function enhanceErrorMessage(baseMessage: string, statusCode?: number): string {
	let errorMessage = baseMessage;

	if (statusCode === 401) {
		errorMessage += ' - API key invalid/expired. Check n8n credentials.';
	} else if (statusCode === 403) {
		errorMessage += ' - Insufficient permissions, server suspended, or API key lacks access.';
	} else if (statusCode === 404) {
		errorMessage += ' - Resource not found. Check server ID/identifier or endpoint URL.';
	} else if (statusCode === 409) {
		errorMessage += ' - Server suspended, power action in progress, or would exceed disk limits.';
	} else if (statusCode === 422) {
		errorMessage += ' - Validation error. Check input parameters.';
	} else if (statusCode === 429) {
		errorMessage +=
			' - Rate limit exceeded. Enable "Retry On Fail" in node settings (5 tries, 5000ms wait).';
	} else if (statusCode === 500) {
		errorMessage += ' - Pterodactyl panel error. Check panel logs.';
	} else if (statusCode === 502) {
		errorMessage += ' - Wings daemon down/unreachable.';
	}

	return errorMessage;
}

/**
 * Make authenticated HTTP request to Pterodactyl API
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
	// Get authentication method from node parameter
	const authentication = this.getNodeParameter('authentication', itemIndex) as
		| 'clientApi'
		| 'applicationApi';

	// Get credentials based on authentication selection
	const credentialType =
		authentication === 'clientApi' ? 'pterodactylClientApi' : 'pterodactylApplicationApi';

	let credentials;
	try {
		credentials = await this.getCredentials(credentialType, itemIndex);
	} catch (error) {
		throw new Error(
			`${authentication === 'clientApi' ? 'Client' : 'Application'} API credentials not configured. Please add the credentials in node settings.`,
		);
	}

	if (!credentials.panelUrl) {
		throw new Error(
			'Panel URL is not configured in credentials. Please configure your Pterodactyl credentials in the node settings.',
		);
	}

	if (!credentials.apiKey) {
		throw new Error('API Key is not configured in credentials');
	}

	const panelUrl = (credentials.panelUrl as string).replace(/\/$/, '');
	const apiBase = authentication === 'clientApi' ? '/api/client' : '/api/application';

	// Destructure option to separate headers from other options
	const { headers: customHeaders, ...otherOptions } = option;

	const options: IHttpRequestOptions = {
		method,
		url: `${panelUrl}${apiBase}${endpoint}`,
		headers: {
			Authorization: `Bearer ${credentials.apiKey}`,
			Accept: 'application/vnd.pterodactyl.v1+json',
			'Content-Type': 'application/json',
			...(customHeaders as object),
		},
		qs,
		body,
		json: true,
		returnFullResponse: true, // Need full response to access status codes
		ignoreHttpStatusErrors: true, // Don't throw on non-2xx status codes
		...otherOptions,
	};

	try {
		const response = await this.helpers.httpRequest(options);

		// Check for error status codes when ignoreHttpStatusErrors is true
		if (response.statusCode && response.statusCode >= 400) {
			// Parse Pterodactyl error format
			if (response.body?.errors) {
				const pterodactylError = response.body.errors[0];
				const baseMessage = `Pterodactyl API Error [${pterodactylError.code}]: ${pterodactylError.detail}`;
				const errorMessage = enhanceErrorMessage(baseMessage, response.statusCode);
				throw new Error(errorMessage);
			}

			// Handle common HTTP status codes with user-friendly messages
			const baseMessage = response.statusMessage || `HTTP ${response.statusCode} error`;
			const errorMessage = enhanceErrorMessage(baseMessage, response.statusCode);

			const error = new Error(errorMessage);
			(error as any).statusCode = response.statusCode;
			throw error;
		}

		// Return body for successful responses
		return response.body;
	} catch (error: any) {
		// Parse Pterodactyl error format from error.response
		if (error.response?.body?.errors) {
			const pterodactylError = error.response.body.errors[0];
			const baseMessage = `Pterodactyl API Error [${pterodactylError.code}]: ${pterodactylError.detail}`;
			const errorMessage = enhanceErrorMessage(baseMessage, error.statusCode);
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
