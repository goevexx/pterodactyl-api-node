import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const deleteAllocationOperation: INodeProperties[] = [
	{
		displayName: 'Server',
		name: 'serverId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getClientServers',
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['network'],
				operation: ['deleteAllocation'],
			},
		},
		default: '',
		description: 'Select the server containing the allocation',
	},
	{
		displayName: 'Allocation',
		name: 'allocationId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getAllocationsForServer',
			loadOptionsDependsOn: ['serverId'],
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['network'],
				operation: ['deleteAllocation'],
			},
		},
		default: '',
		description: 'Select the allocation to delete',
	},
];

export async function deleteAllocation(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as string;
	const allocationId = this.getNodeParameter('allocationId', index) as string;

	await pterodactylApiRequest.call(
		this,
		'DELETE',
		'/api/client',
		`/servers/${serverId}/network/allocations/${allocationId}`,
		{},
		{},
		{},
		index,
	);
	return { success: true };
}
