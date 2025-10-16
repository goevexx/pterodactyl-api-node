import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../transport/PterodactylApiRequest';

export const restoreBackupOperation: INodeProperties[] = [
	{
		displayName: 'Server Identifier',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['backup'],
				operation: ['restore'],
			},
		},
		placeholder: 'abc12def',
		default: '',
		description:
			'The alphanumeric server identifier from your Pterodactyl Panel (e.g., abc12def). Find this in the server URL.',
	},
	{
		displayName: 'Backup ID',
		name: 'backupId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['backup'],
				operation: ['restore'],
			},
		},
		default: '',
		description: 'Backup UUID to restore',
	},
	{
		displayName: 'Truncate Files',
		name: 'truncate',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['backup'],
				operation: ['restore'],
			},
		},
		default: false,
		description: 'Whether to delete existing files before restoring backup',
	},
];

export async function restoreBackup(this: IExecuteFunctions, index: number): Promise<any> {
	// Verify Client API credentials are configured
	try {
		await this.getCredentials('pterodactylClientApi', index);
	} catch {
		throw new Error(
			'Restore Backup operation requires Client API credentials. Please configure and select Client API credentials.',
		);
	}

	const serverId = this.getNodeParameter('serverId', index) as string;
	const backupId = this.getNodeParameter('backupId', index) as string;
	const truncate = this.getNodeParameter('truncate', index) as boolean;

	const body: any = {
		truncate,
	};

	await pterodactylApiRequest.call(
		this,
		'POST',
		`/servers/${serverId}/backups/${backupId}/restore`,
		body,
		{},
		{},
		index,
	);
	return { success: true, backupId, truncate };
}
