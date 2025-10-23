import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const deleteDatabaseOperation: INodeProperties[] = [
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
				operation: ['delete'],
			},
		},
		default: '',
		description: 'Select the server containing the database',
	},
	{
		displayName: 'Database',
		name: 'databaseId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getDatabasesForServer',
			loadOptionsDependsOn: ['serverId'],
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['database'],
				operation: ['delete'],
			},
		},
		default: '',
		description: 'Select the database to delete',
	},
];

export async function deleteDatabase(this: IExecuteFunctions, index: number): Promise<any> {
	// Verify Client API credentials are configured
	try {
		await this.getCredentials('pterodactylClientApi', index);
	} catch {
		throw new Error(
			'Delete Database operation requires Client API credentials. Please configure and select Client API credentials.',
		);
	}

	const serverId = this.getNodeParameter('serverId', index) as string;
	const databaseId = this.getNodeParameter('databaseId', index) as string;

	await pterodactylApiRequest.call(this, 'DELETE',
		'/api/client',
		`/servers/${serverId}/databases/${databaseId}`, {}, {}, {}, index);
	return { success: true, databaseId };
}
