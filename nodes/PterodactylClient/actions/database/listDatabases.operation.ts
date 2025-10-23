import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const listDatabasesOperation: INodeProperties[] = [
	{
		displayName: 'Server',
		name: 'serverId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getClientServers',
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['database'],
				operation: ['list'],
			},
		},
		default: '',
		description: 'Select the server to list databases from',
	},
];

export async function listDatabases(this: IExecuteFunctions, index: number): Promise<any> {
	// Verify Client API credentials are configured
	try {
		await this.getCredentials('pterodactylClientApi', index);
	} catch {
		throw new Error(
			'List Databases operation requires Client API credentials. Please configure and select Client API credentials.',
		);
	}

	const serverId = this.getNodeParameter('serverId', index) as string;

	const response = await pterodactylApiRequest.call(this, 'GET',
		'/api/client',
		`/servers/${serverId}/databases`, {}, {}, {}, index);
	return response.data || [];
}
