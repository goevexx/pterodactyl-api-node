import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const setPrimaryOperation: INodeProperties[] = [
	{
		displayName: 'Server ID',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['network'],
				operation: ['setPrimary'],
			},
		},
		default: '',
		description: 'ID of the server',
	},
	{
		displayName: 'Allocation Id',
		name: 'allocationId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['network'],
				operation: ['setPrimary'],
			},
		},
		default: '',
		description: 'ID of the allocation to set as primary',
	},
];

export async function setPrimary(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as string;
	const allocationId = this.getNodeParameter('allocationId', index) as string;

	const response = await pterodactylApiRequest.call(
		this,
		'POST',
		'/api/client',
		`/servers/${serverId}/network/allocations/${allocationId}/primary`,
		{},
		{},
		{},
		index,
	);
	return response;
}
