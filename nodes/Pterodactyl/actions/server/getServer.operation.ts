import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../transport/PterodactylApiRequest';

export const getServerOperation: INodeProperties[] = [
	{
		displayName: 'Server ID',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['get'],
			},
		},
		placeholder: '11',
		default: '',
		description: 'The numeric server ID (e.g., 11)',
	},
];

export async function getServer(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as string;
	const response = await pterodactylApiRequest.call(this, 'GET', `/servers/${serverId}`);
	return response.attributes || response;
}
