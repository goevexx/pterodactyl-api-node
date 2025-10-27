import { enhanceErrorMessage } from '../../../../shared/utils/errorHandling';

describe('Shared Utils - errorHandling', () => {
	describe('enhanceErrorMessage', () => {
		it('should return base message without enhancement when no status code provided', () => {
			const result = enhanceErrorMessage('Base error message');
			expect(result).toBe('Base error message');
		});

		it('should return base message for unhandled status codes', () => {
			const result = enhanceErrorMessage('Base error message', 418);
			expect(result).toBe('Base error message');
		});

		it('should enhance 401 Unauthorized errors', () => {
			const result = enhanceErrorMessage('Unauthorized', 401);
			expect(result).toBe('Unauthorized - API key invalid/expired. Check n8n credentials.');
		});

		it('should enhance 403 Forbidden errors', () => {
			const result = enhanceErrorMessage('Forbidden', 403);
			expect(result).toBe(
				'Forbidden - Insufficient permissions, server suspended, or API key lacks access.',
			);
		});

		it('should enhance 404 Not Found errors', () => {
			const result = enhanceErrorMessage('Not Found', 404);
			expect(result).toBe(
				'Not Found - Resource not found. Check server ID/identifier or endpoint URL.',
			);
		});

		it('should enhance 409 Conflict errors', () => {
			const result = enhanceErrorMessage('Conflict', 409);
			expect(result).toBe(
				'Conflict - Server suspended, power action in progress, or would exceed disk limits.',
			);
		});

		it('should enhance 422 Validation errors', () => {
			const result = enhanceErrorMessage('Validation failed', 422);
			expect(result).toBe('Validation failed - Validation error. Check input parameters.');
		});

		it('should enhance 429 Rate Limit errors', () => {
			const result = enhanceErrorMessage('Too Many Requests', 429);
			expect(result).toBe(
				'Too Many Requests - Rate limit exceeded. Enable "Retry On Fail" in node settings (5 tries, 5000ms wait).',
			);
		});

		it('should enhance 500 Internal Server errors', () => {
			const result = enhanceErrorMessage('Internal Server Error', 500);
			expect(result).toBe('Internal Server Error - Pterodactyl panel error. Check panel logs.');
		});

		it('should enhance 502 Bad Gateway errors', () => {
			const result = enhanceErrorMessage('Bad Gateway', 502);
			expect(result).toBe('Bad Gateway - Wings daemon down/unreachable.');
		});

		it('should work with Pterodactyl error format messages', () => {
			const pterodactylError =
				'Pterodactyl API Error [ResourceNotFoundException]: Server not found';
			const result = enhanceErrorMessage(pterodactylError, 404);
			expect(result).toContain('Pterodactyl API Error');
			expect(result).toContain('Resource not found');
		});

		it('should preserve original message and append context', () => {
			const result = enhanceErrorMessage('Original error message', 401);
			expect(result).toContain('Original error message');
			expect(result).toContain(' - ');
		});
	});
});
