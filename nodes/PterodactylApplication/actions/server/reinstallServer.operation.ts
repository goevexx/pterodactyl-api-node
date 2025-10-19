import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const reinstallServerOperation: INodeProperties[] = [
	{
		displayName: 'Server Id',
		name: 'serverId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['reinstallServer'],
			},
		},
		default: 0,
		description: 'ID of the server to reinstall',
	}
];

export async function reinstallServer(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as number;
	const response = await pterodactylApiRequest.call(
		this,
		'POST',
		'/api/application',
		`/servers/${serverId}/reinstall`,
		{},
		{},
		{},
		index,
	);
	return response;
}
