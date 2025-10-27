import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const createSubuserOperation: INodeProperties[] = [
	{
		displayName: 'Server',
		name: 'serverId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getClientServers',
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['subuser'],
				operation: ['createSubuser'],
			},
		},
		default: '',
		description: 'Select the server to create subuser for',
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['subuser'],
				operation: ['createSubuser'],
			},
		},
		default: '',
		description: 'Email address of the user',
	},
	{
		displayName: 'Permissions',
		name: 'permissions',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['subuser'],
				operation: ['createSubuser'],
			},
		},
		default: '',
		description: 'Comma-separated list of permissions (e.g., control.console,control.start)',
	},
];

export async function createSubuser(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as string;
	const email = this.getNodeParameter('email', index) as string;
	const permissions = this.getNodeParameter('permissions', index) as string;

	const response = await pterodactylApiRequest.call(
		this,
		'POST',
		'/api/client',
		`/servers/${serverId}/users`,
		{ email, permissions: permissions.split(',').map((p) => p.trim()) },
		{},
		{},
		index,
	);
	return response;
}
