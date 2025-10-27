import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const deleteNodeAllocationOperation: INodeProperties[] = [
	{
		displayName: 'Node',
		name: 'nodeId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getNodes',
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['deleteAllocation'],
			},
		},
		default: '',
		description: 'The node containing the allocation',
	},
	{
		displayName: 'Allocation',
		name: 'allocationId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getAvailableAllocations',
			loadOptionsDependsOn: ['nodeId'],
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['deleteAllocation'],
			},
		},
		default: '',
		description: 'The allocation to delete',
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
	return {
		success: true,
		allocationId,
		nodeId,
		action: 'deleted',
	};
}
