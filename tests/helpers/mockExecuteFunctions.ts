import { IExecuteFunctions, INode } from 'n8n-workflow';

/**
 * Create a mock IExecuteFunctions for testing
 */
export function createMockExecuteFunctions(
	overrides: Partial<IExecuteFunctions> = {},
): IExecuteFunctions {
	const mockNode: INode = {
		id: 'test-node-id',
		name: 'Pterodactyl',
		type: 'n8n-nodes-pterodactyl.pterodactyl',
		typeVersion: 1,
		position: [0, 0],
		parameters: {},
	};

	return {
		getNodeParameter: jest.fn(),
		getCredentials: jest.fn(),
		helpers: {
			httpRequest: jest.fn(),
			httpRequestWithAuthentication: jest.fn(),
			requestWithAuthenticationPaginated: jest.fn(),
		} as any,
		continueOnFail: jest.fn(() => false),
		getNode: jest.fn(() => mockNode),
		getWorkflow: jest.fn(),
		getExecutionId: jest.fn(() => 'test-execution-id'),
		getMode: jest.fn(() => 'manual'),
		getInputData: jest.fn(() => []),
		getItemIndex: jest.fn(() => 0),
		...overrides,
	} as unknown as IExecuteFunctions;
}

/**
 * Create mock credentials for testing
 */
export function createMockCredentials(type: 'client' | 'application' = 'client') {
	return {
		panelUrl: 'https://panel.example.com',
		apiKey: type === 'client' ? 'ptlc_test_key_123' : 'ptla_test_key_456',
	};
}
