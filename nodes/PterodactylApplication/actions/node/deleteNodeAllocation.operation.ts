import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const deleteNodeAllocationOperation: INodeProperties[] = [
	{
		displayName: 'Node Id',
		name: 'nodeId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['deleteNodeAllocation'],
			},
		},
		default: 0,
		description: 'ID of the node',
	},
	{
		displayName: 'Allocation Id',
		name: 'allocationId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['deleteNodeAllocation'],
			},
		},
		default: 0,
		description: 'ID of the allocation to delete',
	}
];

export async function deleteNodeAllocation(this: IExecuteFunctions, index: number): Promise<any> {
	const nodeId = this.getNodeParameter('nodeId', index) as number;
	const allocationId = this.getNodeParameter('allocationId', index) as number;
	await pterodactylApiRequest.call(
		this,
		'DELETE',
		'/api/application',
		`/nodes/${nodeId}/allocations/${allocationId}`,
		{},
		{},
		{},
		index,
	);
	return { success: true };
}
