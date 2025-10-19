/**
 * Enhance error message with helpful context based on HTTP status code
 */
export function enhanceErrorMessage(baseMessage: string, statusCode?: number): string {
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
