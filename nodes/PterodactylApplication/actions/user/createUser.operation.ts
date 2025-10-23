import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const createUserOperation: INodeProperties[] = [
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['createUser'],
			},
		},
		default: '',
		description: 'Email address',
	},
	{
		displayName: 'Username',
		name: 'username',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['createUser'],
			},
		},
		default: '',
		description: 'Username',
	},
	{
		displayName: 'Firstname',
		name: 'firstName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['createUser'],
			},
		},
		default: '',
		description: 'First name',
	},
	{
		displayName: 'Lastname',
		name: 'lastName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['createUser'],
			},
		},
		default: '',
		description: 'Last name',
	},
	{
		displayName: 'External ID',
		name: 'externalId',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['createUser'],
			},
		},
		default: '',
		description: 'External ID (optional)',
	},
	{
		displayName: 'Password',
		name: 'password',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['createUser'],
			},
		},
		default: '',
		description: 'Password (optional, auto-generated if not provided)',
	}
];

export async function createUser(this: IExecuteFunctions, index: number): Promise<any> {
	const email = this.getNodeParameter('email', index) as string;
	const username = this.getNodeParameter('username', index) as string;
	const firstName = this.getNodeParameter('firstName', index) as string;
	const lastName = this.getNodeParameter('lastName', index) as string;
	const externalId = this.getNodeParameter('externalId', index) as string;
	const password = this.getNodeParameter('password', index) as string;
	const response = await pterodactylApiRequest.call(
		this,
		'POST',
		'/api/application',
		`/users`,
		{ email, username, first_name: firstName, last_name: lastName, ...(externalId && { external_id: externalId }), ...(password && { password }) },
		{},
		{},
		index,
	);
	return response.attributes || response;
}
