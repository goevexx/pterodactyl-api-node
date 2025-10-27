import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const getServerOperation: INodeProperties[] = [
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
				operation: ['get'],
			},
		},
		default: '',
		description: 'The server to retrieve',
	},
];

export async function getServer(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as number;
	const response = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/application',
		`/servers/${serverId}`,
		{},
		{},
		{},
		index,
	);
	return response.attributes || response;
}
