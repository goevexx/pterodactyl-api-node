import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../transport/PterodactylApiRequest';

export const updateEmailOperation: INodeProperties[] = [
	{
		displayName: 'New Email',
		name: 'email',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['updateEmail'],
			},
		},
		default: '',
		placeholder: 'user@example.com',
		description: 'New email address',
	},
	{
		displayName: 'Current Password',
		name: 'password',
		type: 'string',
		typeOptions: {
			password: true,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['updateEmail'],
			},
		},
		default: '',
		description: 'Current account password for verification',
	},
];

export async function updateEmail(this: IExecuteFunctions, index: number): Promise<any> {
	const email = this.getNodeParameter('email', index) as string;
	const password = this.getNodeParameter('password', index) as string;

	await pterodactylApiRequest.call(this, 'PUT', '/account/email', { email, password });
	return { success: true, email };
}
