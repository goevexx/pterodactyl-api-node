import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const deleteServerOperation: INodeProperties[] = [
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
				operation: ['delete'],
			},
		},
		default: '',
		description: 'The server to delete',
	}
];

export async function deleteServer(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as number;
	await pterodactylApiRequest.call(
		this,
		'DELETE',
		'/api/application',
		`/servers/${serverId}`,
		{},
		{},
		{},
		index,
	);
	return {
		success: true,
		serverId,
		action: 'deleted',
	};
}
