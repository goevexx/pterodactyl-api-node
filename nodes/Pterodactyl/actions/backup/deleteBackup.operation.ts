import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../transport/PterodactylApiRequest';

export const deleteBackupOperation: INodeProperties[] = [
	{
		displayName: 'Server Identifier',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['backup'],
				operation: ['delete'],
			},
		},
		placeholder: 'abc12def',
		default: '',
		description: 'The server identifier from your Pterodactyl Panel (e.g., abc12def). Find this in the server URL or use the List Servers operation.',
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

	await pterodactylApiRequest.call(
		this,
		'DELETE',
		`/servers/${serverId}/backups/${backupId}`,
		{},
		{},
		{},
		index,
	);
	return { success: true, backupId };
}
