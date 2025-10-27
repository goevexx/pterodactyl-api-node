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
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'user@example.com',
		description: 'Email address for the user',
	},
	{
		displayName: 'Username',
		name: 'username',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['create'],
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
				operation: ['create'],
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
				operation: ['create'],
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
				operation: ['create'],
			},
		},
		default: '',
		description: 'External ID (optional)',
	},
	{
		displayName: 'Password',
		name: 'password',
		type: 'string',
		typeOptions: {
			password: true,
		},
		required: false,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Password (optional, auto-generated if not provided)',
	},
	{
		displayName: 'Language',
		name: 'language',
		type: 'options',
		required: false,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'English',
				value: 'en',
			},
		],
		default: 'en',
		description:
			"User's preferred language. Only languages installed in your Pterodactyl panel are shown. Default: English.",
	},
	{
		displayName: 'Root Admin',
		name: 'rootAdmin',
		type: 'boolean',
		required: false,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['create'],
			},
		},
		default: false,
		description: 'Whether the user should have administrator privileges',
	},
];

export async function createUser(this: IExecuteFunctions, index: number): Promise<any> {
	const email = this.getNodeParameter('email', index) as string;
	const username = this.getNodeParameter('username', index) as string;
	const firstName = this.getNodeParameter('firstName', index) as string;
	const lastName = this.getNodeParameter('lastName', index) as string;
	const externalId = this.getNodeParameter('externalId', index, '') as string;
	const password = this.getNodeParameter('password', index, '') as string;
	const language = this.getNodeParameter('language', index, 'en') as string;
	const rootAdmin = this.getNodeParameter('rootAdmin', index, false) as boolean;

	// Validate email format
	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	if (!emailRegex.test(email)) {
		throw new Error(`Invalid email address: ${email}. Please provide a valid email address.`);
	}

	const body: Record<string, any> = {
		email,
		username,
		first_name: firstName,
		last_name: lastName,
		language,
		root_admin: rootAdmin,
	};

	// Add optional parameters only if provided
	if (externalId) {
		body.external_id = externalId;
	}
	if (password) {
		body.password = password;
	}

	const response = await pterodactylApiRequest.call(
		this,
		'POST',
		'/api/application',
		`/users`,
		body,
		{},
		{},
		index,
	);
	return response.attributes || response;
}
