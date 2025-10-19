import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const getUserOperation: INodeProperties[] = [
	{
		displayName: 'User Id',
		name: 'userId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['getUser'],
			},
		},
		default: 0,
		description: 'ID of the user',
	}
];

export async function getUser(this: IExecuteFunctions, index: number): Promise<any> {
	const userId = this.getNodeParameter('userId', index) as number;
	const response = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/application',
		`/users/${userId}`,
		{},
		{},
		{},
		index,
	);
	return response;
}
