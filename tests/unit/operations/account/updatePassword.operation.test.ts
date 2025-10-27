import { updatePassword } from '../../../../nodes/Pterodactyl/actions/account/updatePassword.operation';
import { createMockExecuteFunctions } from '../../../helpers/mockExecuteFunctions';
import * as PterodactylApiRequest from '../../../../nodes/Pterodactyl/transport/PterodactylApiRequest';

// Mock the transport module
jest.mock('../../../../nodes/Pterodactyl/transport/PterodactylApiRequest');

describe('updatePassword operation', () => {
	let mockExecuteFunctions: any;
	const mockPterodactylApiRequest =
		PterodactylApiRequest.pterodactylApiRequest as jest.MockedFunction<
			typeof PterodactylApiRequest.pterodactylApiRequest
		>;

	beforeEach(() => {
		mockExecuteFunctions = createMockExecuteFunctions();
		jest.clearAllMocks();
	});

	describe('credential validation', () => {
		it('should throw error if Client API credentials are not configured', async () => {
			mockExecuteFunctions.getCredentials.mockRejectedValue(new Error('No credentials'));

			await expect(updatePassword.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Update Password operation requires Client API credentials. Please configure and select Client API credentials.',
			);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 0);
		});

		it('should proceed if Client API credentials are configured', async () => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('currentpass')
				.mockReturnValueOnce('newpass')
				.mockReturnValueOnce('newpass');

			mockPterodactylApiRequest.mockResolvedValue(undefined);

			await updatePassword.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 0);
		});
	});

	describe('parameter handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue(undefined);
		});

		it('should call getNodeParameter with currentPassword', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('oldpass')
				.mockReturnValueOnce('newpass')
				.mockReturnValueOnce('newpass');

			await updatePassword.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('currentPassword', 0);
		});

		it('should call getNodeParameter with password (new password)', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('oldpass')
				.mockReturnValueOnce('newpass')
				.mockReturnValueOnce('newpass');

			await updatePassword.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('password', 0);
		});

		it('should call getNodeParameter with passwordConfirmation', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('oldpass')
				.mockReturnValueOnce('newpass')
				.mockReturnValueOnce('newpass');

			await updatePassword.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('passwordConfirmation', 0);
		});

		it('should retrieve all three password parameters', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('current123')
				.mockReturnValueOnce('new456')
				.mockReturnValueOnce('new456');

			await updatePassword.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledTimes(3);
		});
	});

	describe('API request', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue(undefined);
		});

		it('should call pterodactylApiRequest with correct parameters', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('oldpassword')
				.mockReturnValueOnce('newpassword')
				.mockReturnValueOnce('newpassword');

			await updatePassword.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'PUT',
				'/account/password',
				{
					current_password: 'oldpassword',
					password: 'newpassword',
					password_confirmation: 'newpassword',
				},
				{},
				{},
				0,
			);
		});

		it('should use PUT method', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('old')
				.mockReturnValueOnce('new')
				.mockReturnValueOnce('new');

			await updatePassword.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[0]).toBe('PUT');
		});

		it('should request /account/password endpoint', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('old')
				.mockReturnValueOnce('new')
				.mockReturnValueOnce('new');

			await updatePassword.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[1]).toBe('/account/password');
		});

		it('should use snake_case for API field names', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('current')
				.mockReturnValueOnce('new')
				.mockReturnValueOnce('new');

			await updatePassword.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			const body = callArgs[2];

			expect(body).toHaveProperty('current_password');
			expect(body).toHaveProperty('password');
			expect(body).toHaveProperty('password_confirmation');
		});

		it('should include all password fields in body', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('mycurrentpassword')
				.mockReturnValueOnce('mynewsecurepassword')
				.mockReturnValueOnce('mynewsecurepassword');

			await updatePassword.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[2]).toEqual({
				current_password: 'mycurrentpassword',
				password: 'mynewsecurepassword',
				password_confirmation: 'mynewsecurepassword',
			});
		});

		it('should pass empty query parameters', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('old')
				.mockReturnValueOnce('new')
				.mockReturnValueOnce('new');

			await updatePassword.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[3]).toEqual({});
			expect(callArgs[4]).toEqual({});
		});
	});

	describe('response handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue(undefined);
		});

		it('should return success response', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('old')
				.mockReturnValueOnce('new')
				.mockReturnValueOnce('new');

			const result = await updatePassword.call(mockExecuteFunctions, 0);

			expect(result).toEqual({ success: true });
		});

		it('should return consistent response structure', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('old')
				.mockReturnValueOnce('new')
				.mockReturnValueOnce('new');

			const result = await updatePassword.call(mockExecuteFunctions, 0);

			expect(result).toHaveProperty('success');
			expect(result.success).toBe(true);
		});

		it('should not include password in response', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('old')
				.mockReturnValueOnce('new')
				.mockReturnValueOnce('new');

			const result = await updatePassword.call(mockExecuteFunctions, 0);

			expect(result).not.toHaveProperty('password');
			expect(result).not.toHaveProperty('current_password');
			expect(result).not.toHaveProperty('password_confirmation');
		});
	});

	describe('itemIndex parameter', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue(undefined);
		});

		it('should pass correct itemIndex to getCredentials', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('old')
				.mockReturnValueOnce('new')
				.mockReturnValueOnce('new');

			await updatePassword.call(mockExecuteFunctions, 3);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 3);
		});

		it('should pass correct itemIndex to getNodeParameter calls', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('old')
				.mockReturnValueOnce('new')
				.mockReturnValueOnce('new');

			await updatePassword.call(mockExecuteFunctions, 5);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('currentPassword', 5);
			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('password', 5);
			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('passwordConfirmation', 5);
		});

		it('should pass correct itemIndex to pterodactylApiRequest', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('old')
				.mockReturnValueOnce('new')
				.mockReturnValueOnce('new');

			await updatePassword.call(mockExecuteFunctions, 7);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'PUT',
				'/account/password',
				expect.any(Object),
				{},
				{},
				7,
			);
		});
	});

	describe('error handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
		});

		it('should propagate API request errors', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('old')
				.mockReturnValueOnce('new')
				.mockReturnValueOnce('new');

			const error = new Error('API request failed');
			mockPterodactylApiRequest.mockRejectedValue(error);

			await expect(updatePassword.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'API request failed',
			);
		});

		it('should handle authentication errors (wrong current password)', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('wrongpassword')
				.mockReturnValueOnce('newpass')
				.mockReturnValueOnce('newpass');

			const authError = new Error('Current password is incorrect');
			(authError as any).statusCode = 401;
			mockPterodactylApiRequest.mockRejectedValue(authError);

			await expect(updatePassword.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Current password is incorrect',
			);
		});

		it('should handle validation errors for password mismatch', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('old')
				.mockReturnValueOnce('new1')
				.mockReturnValueOnce('new2');

			const validationError = new Error('Password confirmation does not match');
			(validationError as any).statusCode = 422;
			mockPterodactylApiRequest.mockRejectedValue(validationError);

			await expect(updatePassword.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Password confirmation does not match',
			);
		});

		it('should handle validation errors for weak password', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('old')
				.mockReturnValueOnce('123')
				.mockReturnValueOnce('123');

			const validationError = new Error('Password must be at least 8 characters');
			(validationError as any).statusCode = 422;
			mockPterodactylApiRequest.mockRejectedValue(validationError);

			await expect(updatePassword.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Password must be at least 8 characters',
			);
		});

		it('should handle rate limiting errors', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('old')
				.mockReturnValueOnce('new')
				.mockReturnValueOnce('new');

			const rateLimitError = new Error('Too many password change attempts');
			(rateLimitError as any).statusCode = 429;
			mockPterodactylApiRequest.mockRejectedValue(rateLimitError);

			await expect(updatePassword.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Too many password change attempts',
			);
		});

		it('should handle server errors', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('old')
				.mockReturnValueOnce('new')
				.mockReturnValueOnce('new');

			const serverError = new Error('Internal server error');
			(serverError as any).statusCode = 500;
			mockPterodactylApiRequest.mockRejectedValue(serverError);

			await expect(updatePassword.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Internal server error',
			);
		});
	});
});
