import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const getUserOperation: INodeProperties[] = [
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
				operation: ['get'],
			},
		},
		default: '',
		description: 'The user to retrieve',
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
	return response.attributes || response;
}
