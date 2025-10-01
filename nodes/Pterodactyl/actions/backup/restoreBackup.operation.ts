import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../transport/PterodactylApiRequest';

export const restoreBackupOperation: INodeProperties[] = [
	{
		displayName: 'Server ID',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['backup'],
				operation: ['restore'],
			},
		},
		placeholder: '11',
		default: '',
		description: 'The numeric server ID (e.g., 11)',
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
	const serverId = this.getNodeParameter('serverId', index) as string;
	const backupId = this.getNodeParameter('backupId', index) as string;
	const truncate = this.getNodeParameter('truncate', index) as boolean;

	const body: any = {};
	if (truncate) body.truncate = truncate;

	await pterodactylApiRequest.call(
		this,
		'POST',
		`/servers/${serverId}/backups/${backupId}/restore`,
		body,
	);
	return { success: true, backupId, truncate };
}
