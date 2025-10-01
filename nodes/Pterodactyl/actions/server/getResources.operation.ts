import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../transport/PterodactylApiRequest';

export const getResourcesOperation: INodeProperties[] = [
	{
		displayName: 'Server ID',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['getResources'],
			},
		},
		placeholder: '11',
		default: '',
		description: 'The numeric server ID (e.g., 11). Note: This operation requires Client API authentication.',
	},
];

export async function getResources(this: IExecuteFunctions, index: number): Promise<any> {
	const authentication = this.getNodeParameter('authentication', index) as string;

	if (authentication === 'applicationApi') {
		throw new Error('Get Resources operation requires Client API authentication. Please use Client API credentials or choose a different operation.');
	}

	const serverId = this.getNodeParameter('serverId', index) as string;
	const response = await pterodactylApiRequest.call(this, 'GET', `/servers/${serverId}/resources`);
	return response.attributes || response;
}
