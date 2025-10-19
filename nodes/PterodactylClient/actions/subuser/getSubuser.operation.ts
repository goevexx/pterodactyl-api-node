import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const getSubuserOperation: INodeProperties[] = [
	{
		displayName: 'Server ID',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['subuser'],
				operation: ['getSubuser'],
			},
		},
		default: '',
		description: 'ID of the server',
	},
	{
		displayName: 'Uuid',
		name: 'uuid',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['subuser'],
				operation: ['getSubuser'],
			},
		},
		default: '',
		description: 'UUID of the subuser',
	},
];

export async function getSubuser(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as string;
	const uuid = this.getNodeParameter('uuid', index) as string;

	const response = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/client',
		`/servers/${serverId}/users/${uuid}`,
		{},
		{},
		{},
		index,
	);
	return response;
}
