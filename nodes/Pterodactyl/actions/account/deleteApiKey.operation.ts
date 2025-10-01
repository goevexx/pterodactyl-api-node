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
	const identifier = this.getNodeParameter('identifier', index) as string;

	await pterodactylApiRequest.call(this, 'DELETE', `/account/api-keys/${identifier}`);
	return { success: true, identifier };
}
