import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const listNodeAllocationsOperation: INodeProperties[] = [
	{
		displayName: 'Node ID',
		name: 'nodeId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['listAllocations'],
			},
		},
		default: 1,
		description: 'ID of the node to list allocations from',
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
	// Extract attributes from each object
	return (response.data || []).map((item: any) => item.attributes || item);
}
