import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const listAllocationsOperation: INodeProperties[] = [
	{
		displayName: 'Server ID',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['network'],
				operation: ['listAllocations'],
			},
		},
		default: '',
		description: 'ID of the server',
	},
];

export async function listAllocations(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as string;

	const response = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/client',
		`/servers/${serverId}/network/allocations`,
		{},
		{},
		{},
		index,
	);
	return response.data || [];
}
