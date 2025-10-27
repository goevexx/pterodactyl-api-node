import { createLocation } from '../../../../../nodes/PterodactylApplication/actions/location/createLocation.operation';
import { createMockExecuteFunctions } from '../../../../helpers/mockExecuteFunctions';

describe('PterodactylApplication - createLocation operation', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = createMockExecuteFunctions();
		mockExecuteFunctions.getCredentials.mockResolvedValue({
			panelUrl: 'https://panel.example.com',
			apiKey: 'ptla_test_admin_key',
		});
	});

	it('should create location with short code only', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('us-east') // short
			.mockReturnValueOnce(''); // long (empty)

		const mockLocationResponse = {
			object: 'location',
			attributes: {
				id: 1,
				short: 'us-east',
				long: '',
			},
		};

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 201,
			body: mockLocationResponse,
		});

		const result = await createLocation.call(mockExecuteFunctions, 0);

		// Expect flattened response (attributes content)
		expect(result).toEqual({
			id: 1,
			short: 'us-east',
			long: '',
		});
		expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('short', 0);
	});

	it('should create location with both short and long codes', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('eu-west') // short
			.mockReturnValueOnce('EU West'); // long

		const mockLocationResponse = {
			object: 'location',
			attributes: {
				id: 2,
				short: 'eu-west',
				long: 'EU West',
			},
		};

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 201,
			body: mockLocationResponse,
		});

		const result = await createLocation.call(mockExecuteFunctions, 0);

		// Expect flattened response (attributes content)
		expect(result).toEqual({
			id: 2,
			short: 'eu-west',
			long: 'EU West',
		});
		expect(mockExecuteFunctions.getNodeParameter).toHaveBeenCalledWith('long', 0);
	});

	it('should use POST method to /api/application/locations', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('us-west')
			.mockReturnValueOnce('US West Coast');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 201,
			body: {},
		});

		await createLocation.call(mockExecuteFunctions, 0);

		const callArgs = mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0];
		expect(callArgs.method).toBe('POST');
		expect(callArgs.url).toContain('/api/application/locations');
	});

	it('should include short code in request body', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('asia-south').mockReturnValueOnce('');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 201,
			body: {},
		});

		await createLocation.call(mockExecuteFunctions, 0);

		const callArgs = mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0];
		expect(callArgs.body).toHaveProperty('short', 'asia-south');
	});

	it('should include long description when provided', async () => {
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('us-central')
			.mockReturnValueOnce('US Central Data Center');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 201,
			body: {},
		});

		await createLocation.call(mockExecuteFunctions, 0);

		const callArgs = mockExecuteFunctions.helpers.httpRequest.mock.calls[0][0];
		expect(callArgs.body).toHaveProperty('long', 'US Central Data Center');
	});

	it('should use pterodactylApplicationApi credentials', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('test-loc').mockReturnValueOnce('');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 201,
			body: {},
		});

		await createLocation.call(mockExecuteFunctions, 0);

		expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith(
			'pterodactylApplicationApi',
			0,
		);
	});

	it('should handle validation error for duplicate location', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('us-east').mockReturnValueOnce('');

		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
			statusCode: 422,
			body: {
				errors: [
					{
						code: 'ValidationException',
						detail: 'Location with this short code already exists',
					},
				],
			},
		});

		await expect(createLocation.call(mockExecuteFunctions, 0)).rejects.toThrow();
	});
});
