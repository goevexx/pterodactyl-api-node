import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const reinstallServerOperation: INodeProperties[] = [
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
				operation: ['reinstall'],
			},
		},
		default: '',
		description: 'The server to reinstall',
	},
];

export async function reinstallServer(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as number;
	await pterodactylApiRequest.call(
		this,
		'POST',
		'/api/application',
		`/servers/${serverId}/reinstall`,
		{},
		{},
		{},
		index,
	);
	return {
		success: true,
		serverId,
		action: 'reinstalled',
	};
}
