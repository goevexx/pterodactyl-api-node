import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../transport/PterodactylApiRequest';

export const deleteApiKeyOperation: INodeProperties[] = [
	{
		displayName: 'API Key Identifier',
		name: 'identifier',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['deleteApiKey'],
			},
		},
		default: '',
		description: 'API key identifier to delete',
	},
];

export async function deleteApiKey(this: IExecuteFunctions, index: number): Promise<any> {
	// Verify Client API credentials are configured
	try {
		await this.getCredentials('pterodactylClientApi', index);
	} catch {
		throw new Error(
			'Delete API Key operation requires Client API credentials. Please configure and select Client API credentials.',
		);
	}

	const identifier = this.getNodeParameter('identifier', index) as string;

	await pterodactylApiRequest.call(this, 'DELETE', `/account/api-keys/${identifier}`);
	return { success: true, identifier };
}
