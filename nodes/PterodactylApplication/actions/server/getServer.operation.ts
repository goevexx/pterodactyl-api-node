import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const getServerOperation: INodeProperties[] = [
	{
		displayName: 'Server Id',
		name: 'serverId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['getServer'],
			},
		},
		default: 0,
		description: 'ID of the server',
	}
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
	return response;
}
