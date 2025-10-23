import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const updateServerStartupOperation: INodeProperties[] = [
	{
		displayName: 'Server ID',
		name: 'serverId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateStartup'],
			},
		},
		default: 1,
		description: 'ID of the server',
	},
	{
		displayName: 'Startup',
		name: 'startup',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateStartup'],
			},
		},
		default: '',
		description: 'Startup command',
	},
	{
		displayName: 'Environment',
		name: 'environment',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateStartup'],
			},
		},
		default: '',
		description: 'Environment variables as JSON string',
	},
	{
		displayName: 'Egg',
		name: 'egg',
		type: 'number',
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateStartup'],
			},
		},
		default: 1,
		description: 'Egg ID',
	},
	{
		displayName: 'Dockerimage',
		name: 'dockerImage',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateStartup'],
			},
		},
		default: '',
		description: 'Docker image',
	}
];

export async function updateServerStartup(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as number;
	const startup = this.getNodeParameter('startup', index) as string;
	const environment = this.getNodeParameter('environment', index) as string;
	const egg = this.getNodeParameter('egg', index) as number;
	const dockerImage = this.getNodeParameter('dockerImage', index) as string;
	const response = await pterodactylApiRequest.call(
		this,
		'PATCH',
		'/api/application',
		`/servers/${serverId}/startup`,
		{ ...(startup && { startup }), ...(environment && { environment: JSON.parse(environment) }), ...(egg && { egg }), ...(dockerImage && { docker_image: dockerImage }) },
		{},
		{},
		index,
	);
	return response.attributes || response;
}
