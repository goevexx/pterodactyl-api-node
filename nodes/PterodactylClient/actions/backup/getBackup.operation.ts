import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const getBackupOperation: INodeProperties[] = [
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
				resource: ['backup'],
				operation: ['get'],
			},
		},
		default: '',
		description: 'Select the server containing the backup',
	},
	{
		displayName: 'Backup',
		name: 'backupId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getBackupsForServer',
			loadOptionsDependsOn: ['serverId'],
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['backup'],
				operation: ['get'],
			},
		},
		default: '',
		description: 'Select the backup to retrieve',
	},
];

export async function getBackup(this: IExecuteFunctions, index: number): Promise<any> {
	// Verify Client API credentials are configured
	try {
		await this.getCredentials('pterodactylClientApi', index);
	} catch {
		throw new Error(
			'Get Backup operation requires Client API credentials. Please configure and select Client API credentials.',
		);
	}

	const serverId = this.getNodeParameter('serverId', index) as string;
	const backupId = this.getNodeParameter('backupId', index) as string;

	const response = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/client',
		`/servers/${serverId}/backups/${backupId}`,
		{},
		{},
		{},
		index,
	);
	return response;
}
