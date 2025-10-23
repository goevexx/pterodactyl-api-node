import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const deleteUserOperation: INodeProperties[] = [
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
				operation: ['deleteUser'],
			},
		},
		default: '',
		description: 'The user to delete',
	}
];

export async function deleteUser(this: IExecuteFunctions, index: number): Promise<any> {
	const userId = this.getNodeParameter('userId', index) as number;
	await pterodactylApiRequest.call(
		this,
		'DELETE',
		'/api/application',
		`/users/${userId}`,
		{},
		{},
		{},
		index,
	);
	return { success: true };
}
