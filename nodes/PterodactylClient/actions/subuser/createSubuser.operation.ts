import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const createSubuserOperation: INodeProperties[] = [
	{
		displayName: 'Permissions',
		name: 'permissions',
		type: 'multiOptions',
		typeOptions: {
			loadOptionsMethod: 'getAvailablePermissions',
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['subuser'],
				operation: ['createSubuser'],
			},
		},
		default: [],
		description: 'Select permissions for this subuser',
	},
];

export async function createSubuser(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as string;
	const email = this.getNodeParameter('email', index) as string;
	const permissions = this.getNodeParameter('permissions', index) as string[];

	const response = await pterodactylApiRequest.call(
		this,
		'POST',
		'/api/client',
		`/servers/${serverId}/users`,
		{ email, permissions },
		{},
		{},
		index,
	);
	return response;
}
