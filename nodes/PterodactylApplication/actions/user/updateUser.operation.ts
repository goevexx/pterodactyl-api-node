import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const updateUserOperation: INodeProperties[] = [
	{
		displayName: 'User',
		name: 'userId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getUsers',
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'The user to update',
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['update'],
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
		required: false,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['update'],
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
				operation: ['update'],
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
				operation: ['update'],
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
				operation: ['update'],
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
				operation: ['update'],
			},
		},
		default: '',
		description: 'New password (leave empty to keep current password)',
	},
	{
		displayName: 'Language',
		name: 'language',
		type: 'options',
		required: false,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['update'],
			},
		},
		options: [
			{
				name: 'Keep Current Value',
				value: '',
			},
			{
				name: 'English',
				value: 'en',
			},
		],
		default: '',
		description: 'User\'s preferred language. Only languages installed in your Pterodactyl panel are shown. Leave as "Keep Current Value" to preserve existing language setting.',
	},
	{
		displayName: 'Update Root Admin',
		name: 'updateRootAdmin',
		type: 'boolean',
		required: false,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['update'],
			},
		},
		default: false,
		description: 'Check this box if you want to change the root admin status. Leave unchecked to keep current value.',
	},
	{
		displayName: 'Root Admin',
		name: 'rootAdmin',
		type: 'boolean',
		required: false,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['update'],
				updateRootAdmin: [true],
			},
		},
		default: false,
		description: 'Whether the user should have administrator privileges',
	}
];

export async function updateUser(this: IExecuteFunctions, index: number): Promise<any> {
	const userId = this.getNodeParameter('userId', index) as number;

	// First, fetch the current user data
	const currentUserResponse = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/application',
		`/users/${userId}`,
		{},
		{},
		{},
		index,
	);

	const currentUser = currentUserResponse.attributes;

	// Get user input values (empty string if not provided)
	const emailInput = this.getNodeParameter('email', index, '') as string;
	const usernameInput = this.getNodeParameter('username', index, '') as string;
	const firstNameInput = this.getNodeParameter('firstName', index, '') as string;
	const lastNameInput = this.getNodeParameter('lastName', index, '') as string;
	const externalIdInput = this.getNodeParameter('externalId', index, '') as string;
	const passwordInput = this.getNodeParameter('password', index, '') as string;
	const languageInput = this.getNodeParameter('language', index, '') as string;
	const updateRootAdmin = this.getNodeParameter('updateRootAdmin', index, false) as boolean;
	const rootAdminInput = updateRootAdmin ? this.getNodeParameter('rootAdmin', index, false) as boolean : null;

	// Use input values OR fall back to current values
	const email = emailInput || currentUser.email;
	const username = usernameInput || currentUser.username;
	const firstName = firstNameInput || currentUser.first_name;
	const lastName = lastNameInput || currentUser.last_name;
	const externalId = externalIdInput || currentUser.external_id || '';
	const password = passwordInput; // Only use if explicitly provided
	const language = languageInput || currentUser.language || 'en';
	const rootAdmin = rootAdminInput !== null ? rootAdminInput : (currentUser.root_admin || false);

	// Validate email format (only if email is being changed)
	if (emailInput) {
		const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		if (!emailRegex.test(emailInput)) {
			throw new Error(`Invalid email address: ${emailInput}. Please provide a valid email address.`);
		}
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
		'PATCH',
		'/api/application',
		`/users/${userId}`,
		body,
		{},
		{},
		index,
	);
	return response.attributes || response;
}
