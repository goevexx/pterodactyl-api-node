import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const deleteBackupOperation: INodeProperties[] = [
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
				operation: ['delete'],
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
				operation: ['delete'],
			},
		},
		default: '',
		description: 'Select the backup to delete',
	},
];

export async function deleteBackup(this: IExecuteFunctions, index: number): Promise<any> {
	// Verify Client API credentials are configured
	try {
		await this.getCredentials('pterodactylClientApi', index);
	} catch {
		throw new Error(
			'Delete Backup operation requires Client API credentials. Please configure and select Client API credentials.',
		);
	}

	const serverId = this.getNodeParameter('serverId', index) as string;
	const backupId = this.getNodeParameter('backupId', index) as string;

	await pterodactylApiRequest.call(
		this,
		'DELETE',
		'/api/client',
		`/servers/${serverId}/backups/${backupId}`,
		{},
		{},
		{},
		index,
	);
	return { success: true, backupId };
}
