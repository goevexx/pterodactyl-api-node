import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../transport/PterodactylApiRequest';

export const listDatabasesOperation: INodeProperties[] = [
	{
		displayName: 'Server Identifier',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['database'],
				operation: ['list'],
			},
		},
		placeholder: 'abc12def',
		default: '',
		description: 'The server identifier from your Pterodactyl Panel (e.g., abc12def). Find this in the server URL or use the List Servers operation.',
	},
];

export async function listDatabases(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as string;

	const response = await pterodactylApiRequest.call(this, 'GET', `/servers/${serverId}/databases`);
	return response.data || [];
}
