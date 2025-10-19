import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const listNodeAllocationsOperation: INodeProperties[] = [
	{
		displayName: 'Node Id',
		name: 'nodeId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['listNodeAllocations'],
			},
		},
		default: 0,
		description: 'ID of the node',
	}
];

export async function listNodeAllocations(this: IExecuteFunctions, index: number): Promise<any> {
	const nodeId = this.getNodeParameter('nodeId', index) as number;
	const response = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/application',
		`/nodes/${nodeId}/allocations`,
		{},
		{},
		{},
		index,
	);
	return response.data || [];
}
