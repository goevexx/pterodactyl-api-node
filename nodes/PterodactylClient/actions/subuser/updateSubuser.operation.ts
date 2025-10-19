import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const updateSubuserOperation: INodeProperties[] = [
	{
		displayName: 'Server ID',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['subuser'],
				operation: ['updateSubuser'],
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
				operation: ['updateSubuser'],
			},
		},
		default: '',
		description: 'UUID of the subuser',
	},
	{
		displayName: 'Permissions',
		name: 'permissions',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['subuser'],
				operation: ['updateSubuser'],
			},
		},
		default: '',
		description: 'Comma-separated list of permissions',
	},
];

export async function updateSubuser(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as string;
	const uuid = this.getNodeParameter('uuid', index) as string;
	const permissions = this.getNodeParameter('permissions', index) as string;

	const response = await pterodactylApiRequest.call(
		this,
		'POST',
		'/api/client',
		`/servers/${serverId}/users/${uuid}`,
		{ permissions: permissions.split(',').map(p => p.trim()) },
		{},
		{},
		index,
	);
	return response;
}
