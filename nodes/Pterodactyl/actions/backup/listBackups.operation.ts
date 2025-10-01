import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../transport/PterodactylApiRequest';

export const listBackupsOperation: INodeProperties[] = [
	{
		displayName: 'Server ID',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['backup'],
				operation: ['list'],
			},
		},
		placeholder: '11',
		default: '',
		description: 'The numeric server ID (e.g., 11)',
	},
];

export async function listBackups(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as string;

	const response = await pterodactylApiRequest.call(this, 'GET', `/servers/${serverId}/backups`);
	return response.data || [];
}
