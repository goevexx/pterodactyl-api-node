import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../transport/PterodactylApiRequest';

export const getBackupOperation: INodeProperties[] = [
	{
		displayName: 'Server ID',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['backup'],
				operation: ['get'],
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
				operation: ['get'],
			},
		},
		default: '',
		description: 'Backup UUID to retrieve details for',
	},
];

export async function getBackup(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as string;
	const backupId = this.getNodeParameter('backupId', index) as string;

	const response = await pterodactylApiRequest.call(
		this,
		'GET',
		`/servers/${serverId}/backups/${backupId}`,
	);
	return response;
}
