import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const forceDeleteServerOperation: INodeProperties[] = [
	{
		displayName: 'Server',
		name: 'serverId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getServers',
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['forceDelete'],
			},
		},
		default: '',
		description: 'The server to force delete',
	}
];

export async function forceDeleteServer(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as number;
	await pterodactylApiRequest.call(
		this,
		'DELETE',
		'/api/application',
		`/servers/${serverId}/force`,
		{},
		{},
		{},
		index,
	);
	return {
		success: true,
		serverId,
		action: 'forceDeleted',
	};
}
