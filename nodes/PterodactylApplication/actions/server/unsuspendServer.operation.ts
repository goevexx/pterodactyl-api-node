import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const unsuspendServerOperation: INodeProperties[] = [
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
				operation: ['unsuspend'],
			},
		},
		default: '',
		description: 'The server to unsuspend',
	}
];

export async function unsuspendServer(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as number;
	const response = await pterodactylApiRequest.call(
		this,
		'POST',
		'/api/application',
		`/servers/${serverId}/unsuspend`,
		{},
		{},
		{},
		index,
	);
	return response.attributes || response;
}
