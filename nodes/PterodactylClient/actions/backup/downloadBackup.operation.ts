import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const downloadBackupOperation: INodeProperties[] = [
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
				operation: ['download'],
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
				operation: ['download'],
			},
		},
		default: '',
		description: 'Select the backup to download',
	},
];

export async function downloadBackup(this: IExecuteFunctions, index: number): Promise<any> {
	// Verify Client API credentials are configured
	try {
		await this.getCredentials('pterodactylClientApi', index);
	} catch {
		throw new Error(
			'Download Backup operation requires Client API credentials. Please configure and select Client API credentials.',
		);
	}

	const serverId = this.getNodeParameter('serverId', index) as string;
	const backupId = this.getNodeParameter('backupId', index) as string;

	const response = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/client',
		`/servers/${serverId}/backups/${backupId}/download`,
		{},
		{},
		{},
		index,
	);
	return response;
}
