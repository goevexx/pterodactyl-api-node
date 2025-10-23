import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const deleteUserOperation: INodeProperties[] = [
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['deleteUser'],
			},
		},
		default: 1,
		description: 'ID of the user to delete',
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
