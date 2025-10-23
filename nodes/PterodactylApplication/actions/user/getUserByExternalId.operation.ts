import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const getUserByExternalIdOperation: INodeProperties[] = [
	{
		displayName: 'External ID',
		name: 'externalId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['getByExternalId'],
			},
		},
		default: '',
		description: 'External ID of the user',
	}
];

export async function getUserByExternalId(this: IExecuteFunctions, index: number): Promise<any> {
	const externalId = this.getNodeParameter('externalId', index) as string;
	const response = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/application',
		`/users/external/${externalId}`,
		{},
		{},
		{},
		index,
	);
	return response.attributes || response;
}
