import { IExecuteFunctions, INodeProperties} from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

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
		description: 'The unique identifier of the API key to delete',
	},
];

export async function deleteApiKey(this: IExecuteFunctions, index: number): Promise<any> {
	const identifier = this.getNodeParameter('identifier', index) as string;

	await pterodactylApiRequest.call(
		this,
		'DELETE',
		'/api/client',
		`/account/api-keys/${identifier}`,
		{},
		{},
		{},
		index,
	);
	return { success: true, identifier };
}
