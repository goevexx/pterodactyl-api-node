import { updateEmail } from '../../../../nodes/Pterodactyl/actions/account/updateEmail.operation';
import { createMockExecuteFunctions } from '../../../helpers/mockExecuteFunctions';
import * as PterodactylApiRequest from '../../../../nodes/Pterodactyl/transport/PterodactylApiRequest';

// Mock the transport module
jest.mock('../../../../nodes/Pterodactyl/transport/PterodactylApiRequest');

describe('updateEmail operation', () => {
	let mockExecuteFunctions: any;
	const mockPterodactylApiRequest = PterodactylApiRequest.pterodactylApiRequest as jest.MockedFunction<typeof PterodactylApiRequest.pterodactylApiRequest>;

	beforeEach(() => {
		mockExecuteFunctions = createMockExecuteFunctions();
		jest.clearAllMocks();
	});

	describe('credential validation', () => {
		it('should throw error if Client API credentials are not configured', async () => {
			mockExecuteFunctions.getCredentials.mockRejectedValue(new Error('No credentials'));

			await expect(updateEmail.call(mockExecuteFunctions, 0)).rejects.toThrow(
				'Update Email operation requires Client API credentials. Please configure and select Client API credentials.',
			);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 0);
		});

		it('should proceed if Client API credentials are configured', async () => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('newemail@example.com')
				.mockReturnValueOnce('currentpassword');

			mockPterodactylApiRequest.mockResolvedValue(undefined);

			await updateEmail.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 0);
		});
	});

	describe('parameter handling', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue(undefined);
		});

		it('should call getNodeParameter with email', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('newemail@example.com')
				.mockReturnValueOnce('password123');

			await updateEmail.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('email', 0);
		});

		it('should call getNodeParameter with password', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('newemail@example.com')
				.mockReturnValueOnce('password123');

			await updateEmail.call(mockExecuteFunctions, 0);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('password', 0);
		});

		it('should handle different email formats', async () => {
			const emails = [
				'user@example.com',
				'test.user+tag@domain.co.uk',
				'admin@subdomain.example.org',
			];

			for (const email of emails) {
				jest.clearAllMocks();
				mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce(email)
					.mockReturnValueOnce('password');

				mockPterodactylApiRequest.mockResolvedValue(undefined);

				await updateEmail.call(mockExecuteFunctions, 0);

				const callArgs = mockPterodactylApiRequest.mock.calls[0];
				expect((callArgs[2] as any).email).toBe(email);
			}
		});
	});

	describe('API request', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue(undefined);
		});

		it('should call pterodactylApiRequest with correct parameters', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('newemail@example.com')
				.mockReturnValueOnce('mypassword');

			await updateEmail.call(mockExecuteFunctions, 0);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'PUT',
				'/account/email',
				{
					email: 'newemail@example.com',
					password: 'mypassword',
				},
				{},
				{},
				0,
			);
		});

		it('should use PUT method', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('test@example.com')
				.mockReturnValueOnce('password');

			await updateEmail.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[0]).toBe('PUT');
		});

		it('should request /account/email endpoint', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('test@example.com')
				.mockReturnValueOnce('password');

			await updateEmail.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[1]).toBe('/account/email');
		});

		it('should include both email and password in body', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('updated@example.com')
				.mockReturnValueOnce('securepassword123');

			await updateEmail.call(mockExecuteFunctions, 0);

			const callArgs = mockPterodactylApiRequest.mock.calls[0];
			expect(callArgs[2]).toEqual({
				email: 'updated@example.com',
				password: 'securepassword123',
			});
		});

		it('should pass empty query parameters', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('test@example.com')
				.mockReturnValueOnce('password');

			await updateEmail.call(mockExecuteFunctions, 0);

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

		it('should return success response with new email', async () => {
			const newEmail = 'newemail@example.com';
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce(newEmail)
				.mockReturnValueOnce('password');

			const result = await updateEmail.call(mockExecuteFunctions, 0);

			expect(result).toEqual({
				success: true,
				email: newEmail,
			});
		});

		it('should return consistent response structure', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('test@example.com')
				.mockReturnValueOnce('password');

			const result = await updateEmail.call(mockExecuteFunctions, 0);

			expect(result).toHaveProperty('success');
			expect(result).toHaveProperty('email');
			expect(result.success).toBe(true);
		});

		it('should include updated email in response', async () => {
			const testEmails = [
				'user1@example.com',
				'user2@example.com',
				'admin@company.org',
			];

			for (const email of testEmails) {
				jest.clearAllMocks();
				mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
				mockExecuteFunctions.getNodeParameter
					.mockReturnValueOnce(email)
					.mockReturnValueOnce('password');
				mockPterodactylApiRequest.mockResolvedValue(undefined);

				const result = await updateEmail.call(mockExecuteFunctions, 0);

				expect(result.email).toBe(email);
			}
		});
	});

	describe('itemIndex parameter', () => {
		beforeEach(() => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({ apiKey: 'test-key' });
			mockPterodactylApiRequest.mockResolvedValue(undefined);
		});

		it('should pass correct itemIndex to getCredentials', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('test@example.com')
				.mockReturnValueOnce('password');

			await updateEmail.call(mockExecuteFunctions, 3);

			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('pterodactylClientApi', 3);
		});

		it('should pass correct itemIndex to getNodeParameter calls', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('test@example.com')
				.mockReturnValueOnce('password');

			await updateEmail.call(mockExecuteFunctions, 5);

			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('email', 5);
			expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('password', 5);
		});

		it('should pass correct itemIndex to pterodactylApiRequest', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('test@example.com')
				.mockReturnValueOnce('password');

			await updateEmail.call(mockExecuteFunctions, 7);

			expect(mockPterodactylApiRequest).toHaveBeenCalledWith(
				'PUT',
				'/account/email',
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
				.mockReturnValueOnce('test@example.com')
				.mockReturnValueOnce('password');

			const error = new Error('API request failed');
			mockPterodactylApiRequest.mockRejectedValue(error);

			await expect(updateEmail.call(mockExecuteFunctions, 0)).rejects.toThrow('API request failed');
		});

		it('should handle authentication errors', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('test@example.com')
				.mockReturnValueOnce('wrongpassword');

			const authError = new Error('Invalid password');
			(authError as any).statusCode = 401;
			mockPterodactylApiRequest.mockRejectedValue(authError);

			await expect(updateEmail.call(mockExecuteFunctions, 0)).rejects.toThrow('Invalid password');
		});

		it('should handle validation errors for invalid email', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('invalid-email')
				.mockReturnValueOnce('password');

			const validationError = new Error('Invalid email format');
			(validationError as any).statusCode = 422;
			mockPterodactylApiRequest.mockRejectedValue(validationError);

			await expect(updateEmail.call(mockExecuteFunctions, 0)).rejects.toThrow('Invalid email format');
		});

		it('should handle email already in use error', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('taken@example.com')
				.mockReturnValueOnce('password');

			const conflictError = new Error('Email already in use');
			(conflictError as any).statusCode = 409;
			mockPterodactylApiRequest.mockRejectedValue(conflictError);

			await expect(updateEmail.call(mockExecuteFunctions, 0)).rejects.toThrow('Email already in use');
		});

		it('should handle server errors', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('test@example.com')
				.mockReturnValueOnce('password');

			const serverError = new Error('Internal server error');
			(serverError as any).statusCode = 500;
			mockPterodactylApiRequest.mockRejectedValue(serverError);

			await expect(updateEmail.call(mockExecuteFunctions, 0)).rejects.toThrow('Internal server error');
		});
	});
});
