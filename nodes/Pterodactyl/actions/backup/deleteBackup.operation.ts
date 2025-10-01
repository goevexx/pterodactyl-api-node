import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../transport/PterodactylApiRequest';

export const deleteBackupOperation: INodeProperties[] = [
	{
		displayName: 'Server ID',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['backup'],
				operation: ['delete'],
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
				operation: ['delete'],
			},
		},
		default: '',
		description: 'Backup UUID to delete',
	},
];

export async function deleteBackup(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as string;
	const backupId = this.getNodeParameter('backupId', index) as string;

	await pterodactylApiRequest.call(this, 'DELETE', `/servers/${serverId}/backups/${backupId}`);
	return { success: true, backupId };
}
