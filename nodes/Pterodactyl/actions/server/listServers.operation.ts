import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import {
	pterodactylApiRequest,
	pterodactylApiRequestAllItems,
} from '../../transport/PterodactylApiRequest';

export const listServersOperation: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['list'],
			},
		},
		default: true,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['list'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 50,
		description: 'Max number of results to return',
	},
];

export async function listServers(this: IExecuteFunctions, index: number): Promise<any> {
	const returnAll = this.getNodeParameter('returnAll', index) as boolean;

	if (returnAll) {
		return await pterodactylApiRequestAllItems.call(this, 'GET', '/servers');
	} else {
		const limit = this.getNodeParameter('limit', index) as number;
		const response = await pterodactylApiRequest.call(this, 'GET', '/servers', {}, { per_page: limit });
		return response.data || [];
	}
}
