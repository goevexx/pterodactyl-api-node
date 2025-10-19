import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const updateServerBuildOperation: INodeProperties[] = [
	{
		displayName: 'Server Id',
		name: 'serverId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateServerBuild'],
			},
		},
		default: 0,
		description: 'ID of the server',
	},
	{
		displayName: 'Allocation',
		name: 'allocation',
		type: 'number',
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateServerBuild'],
			},
		},
		default: 0,
		description: 'Default allocation ID',
	},
	{
		displayName: 'Limits',
		name: 'limits',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateServerBuild'],
			},
		},
		default: '',
		description: 'Resource limits as JSON string',
	},
	{
		displayName: 'Featurelimits',
		name: 'featureLimits',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateServerBuild'],
			},
		},
		default: '',
		description: 'Feature limits as JSON string',
	}
];

export async function updateServerBuild(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as number;
	const allocation = this.getNodeParameter('allocation', index) as number;
	const limits = this.getNodeParameter('limits', index) as string;
	const featureLimits = this.getNodeParameter('featureLimits', index) as string;
	const response = await pterodactylApiRequest.call(
		this,
		'PATCH',
		'/api/application',
		`/servers/${serverId}/build`,
		{ ...(allocation && { allocation }), ...(limits && { limits: JSON.parse(limits) }), ...(featureLimits && { feature_limits: JSON.parse(featureLimits) }) },
		{},
		{},
		index,
	);
	return response;
}
