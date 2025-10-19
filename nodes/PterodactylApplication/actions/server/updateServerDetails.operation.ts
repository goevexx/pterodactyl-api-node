import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const updateServerDetailsOperation: INodeProperties[] = [
	{
		displayName: 'Server Id',
		name: 'serverId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateServerDetails'],
			},
		},
		default: 0,
		description: 'ID of the server',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateServerDetails'],
			},
		},
		default: '',
		description: 'Server name',
	},
	{
		displayName: 'User Id',
		name: 'userId',
		type: 'number',
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateServerDetails'],
			},
		},
		default: 0,
		description: 'Owner user ID',
	},
	{
		displayName: 'External Id',
		name: 'externalId',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateServerDetails'],
			},
		},
		default: '',
		description: 'External ID',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateServerDetails'],
			},
		},
		default: '',
		description: 'Server description',
	}
];

export async function updateServerDetails(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as number;
	const name = this.getNodeParameter('name', index) as string;
	const userId = this.getNodeParameter('userId', index) as number;
	const externalId = this.getNodeParameter('externalId', index) as string;
	const description = this.getNodeParameter('description', index) as string;
	const response = await pterodactylApiRequest.call(
		this,
		'PATCH',
		'/api/application',
		`/servers/${serverId}/details`,
		{ ...(name && { name }), ...(userId && { user: userId }), ...(externalId && { external_id: externalId }), ...(description && { description }) },
		{},
		{},
		index,
	);
	return response;
}
