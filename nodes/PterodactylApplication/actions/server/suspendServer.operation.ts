import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const suspendServerOperation: INodeProperties[] = [
	{
		displayName: 'Server Id',
		name: 'serverId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['suspendServer'],
			},
		},
		default: 0,
		description: 'ID of the server to suspend',
	}
];

export async function suspendServer(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as number;
	const response = await pterodactylApiRequest.call(
		this,
		'POST',
		'/api/application',
		`/servers/${serverId}/suspend`,
		{},
		{},
		{},
		index,
	);
	return response;
}
