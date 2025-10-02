import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../transport/PterodactylApiRequest';

export const updatePasswordOperation: INodeProperties[] = [
	{
		displayName: 'Current Password',
		name: 'currentPassword',
		type: 'string',
		typeOptions: {
			password: true,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['updatePassword'],
			},
		},
		default: '',
		description: 'Current account password',
	},
	{
		displayName: 'New Password',
		name: 'password',
		type: 'string',
		typeOptions: {
			password: true,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['updatePassword'],
			},
		},
		default: '',
		description: 'New password',
	},
	{
		displayName: 'Confirm Password',
		name: 'passwordConfirmation',
		type: 'string',
		typeOptions: {
			password: true,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['updatePassword'],
			},
		},
		default: '',
		description: 'Confirm new password',
	},
];

export async function updatePassword(this: IExecuteFunctions, index: number): Promise<any> {
	const currentPassword = this.getNodeParameter('currentPassword', index) as string;
	const password = this.getNodeParameter('password', index) as string;
	const passwordConfirmation = this.getNodeParameter('passwordConfirmation', index) as string;

	await pterodactylApiRequest.call(this, 'PUT', '/account/password', {
		current_password: currentPassword,
		password,
		password_confirmation: passwordConfirmation,
	}, {}, {}, index);
	return { success: true };
}
