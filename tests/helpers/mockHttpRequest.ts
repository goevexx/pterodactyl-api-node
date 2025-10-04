/**
 * Create a mock HTTP response for testing
 */
export function createMockHttpResponse(data: any, statusCode: number = 200) {
	return {
		statusCode,
		body: data,
		headers: {
			'content-type': 'application/json',
		},
	};
}

/**
 * Create a mock Pterodactyl error response
 */
export function createMockErrorResponse(
	message: string,
	statusCode: number = 400,
	errors?: any[]
) {
	return {
		statusCode,
		body: {
			errors: errors || [
				{
					code: 'error_code',
					status: statusCode.toString(),
					detail: message,
				},
			],
		},
	};
}

/**
 * Create a mock HTTP request error
 */
export function createMockHttpError(message: string, statusCode: number = 500) {
	const error: any = new Error(message);
	error.statusCode = statusCode;
	error.response = {
		statusCode,
		body: {
			errors: [
				{
					code: 'http_error',
					status: statusCode.toString(),
					detail: message,
				},
			],
		},
	};
	return error;
}
