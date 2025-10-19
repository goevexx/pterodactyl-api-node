import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const createServerOperation: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['createServer'],
			},
		},
		default: '',
		description: 'Server name',
	},
	{
		displayName: 'User Id',
		name: 'userId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['createServer'],
			},
		},
		default: 0,
		description: 'Owner user ID',
	},
	{
		displayName: 'Egg',
		name: 'egg',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['createServer'],
			},
		},
		default: 0,
		description: 'Egg ID',
	},
	{
		displayName: 'Dockerimage',
		name: 'dockerImage',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['createServer'],
			},
		},
		default: '',
		description: 'Docker image',
	},
	{
		displayName: 'Startup',
		name: 'startup',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['createServer'],
			},
		},
		default: '',
		description: 'Startup command',
	},
	{
		displayName: 'Environment',
		name: 'environment',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['createServer'],
			},
		},
		default: '',
		description: 'Environment variables as JSON string',
	},
	{
		displayName: 'Limits',
		name: 'limits',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['createServer'],
			},
		},
		default: '',
		description: 'Resource limits as JSON string (memory, swap, disk, io, cpu)',
	},
	{
		displayName: 'Featurelimits',
		name: 'featureLimits',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['createServer'],
			},
		},
		default: '',
		description: 'Feature limits as JSON string (databases, allocations, backups)',
	},
	{
		displayName: 'Allocation',
		name: 'allocation',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['createServer'],
			},
		},
		default: '',
		description: 'Allocation as JSON string (default allocation ID)',
	}
];

export async function createServer(this: IExecuteFunctions, index: number): Promise<any> {
	const name = this.getNodeParameter('name', index) as string;
	const userId = this.getNodeParameter('userId', index) as number;
	const egg = this.getNodeParameter('egg', index) as number;
	const dockerImage = this.getNodeParameter('dockerImage', index) as string;
	const startup = this.getNodeParameter('startup', index) as string;
	const environment = this.getNodeParameter('environment', index) as string;
	const limits = this.getNodeParameter('limits', index) as string;
	const featureLimits = this.getNodeParameter('featureLimits', index) as string;
	const allocation = this.getNodeParameter('allocation', index) as string;
	const response = await pterodactylApiRequest.call(
		this,
		'POST',
		'/api/application',
		`/servers`,
		{ name, user: userId, egg, docker_image: dockerImage, startup, environment: JSON.parse(environment), limits: JSON.parse(limits), feature_limits: JSON.parse(featureLimits), allocation: JSON.parse(allocation) },
		{},
		{},
		index,
	);
	return response;
}
