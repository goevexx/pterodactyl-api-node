import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const updateUserOperation: INodeProperties[] = [
	{
		displayName: 'User Id',
		name: 'userId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['updateUser'],
			},
		},
		default: 0,
		description: 'ID of the user',
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['updateUser'],
			},
		},
		default: '',
		description: 'Email address',
	},
	{
		displayName: 'Username',
		name: 'username',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['updateUser'],
			},
		},
		default: '',
		description: 'Username',
	},
	{
		displayName: 'Firstname',
		name: 'firstName',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['updateUser'],
			},
		},
		default: '',
		description: 'First name',
	},
	{
		displayName: 'Lastname',
		name: 'lastName',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['updateUser'],
			},
		},
		default: '',
		description: 'Last name',
	},
	{
		displayName: 'Password',
		name: 'password',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['updateUser'],
			},
		},
		default: '',
		description: 'New password',
	}
];

export async function updateUser(this: IExecuteFunctions, index: number): Promise<any> {
	const userId = this.getNodeParameter('userId', index) as number;
	const email = this.getNodeParameter('email', index) as string;
	const username = this.getNodeParameter('username', index) as string;
	const firstName = this.getNodeParameter('firstName', index) as string;
	const lastName = this.getNodeParameter('lastName', index) as string;
	const password = this.getNodeParameter('password', index) as string;
	const response = await pterodactylApiRequest.call(
		this,
		'PATCH',
		'/api/application',
		`/users/${userId}`,
		{ ...(email && { email }), ...(username && { username }), ...(firstName && { first_name: firstName }), ...(lastName && { last_name: lastName }), ...(password && { password }) },
		{},
		{},
		index,
	);
	return response;
}
