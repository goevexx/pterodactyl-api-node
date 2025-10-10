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
				operation: ['delete'],
			},
		},
		default: '',
		description: 'Backup UUID to delete',
	},
];

export async function deleteBackup(this: IExecuteFunctions, index: number): Promise<any> {
	const authentication = this.getNodeParameter('authentication', index) as string;

	if (authentication === 'applicationApi') {
		throw new Error(
			'Delete Backup operation requires Client API authentication. Please use Client API credentials or choose a different operation.',
		);
	}

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
