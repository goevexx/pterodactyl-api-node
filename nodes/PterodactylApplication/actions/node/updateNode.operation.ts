import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const updateNodeOperation: INodeProperties[] = [
	{
		displayName: 'Node Id',
		name: 'nodeId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['updateNode'],
			},
		},
		default: 0,
		description: 'ID of the node',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['updateNode'],
			},
		},
		default: '',
		description: 'Node name',
	},
	{
		displayName: 'Fqdn',
		name: 'fqdn',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['updateNode'],
			},
		},
		default: '',
		description: 'Fully qualified domain name',
	},
	{
		displayName: 'Scheme',
		name: 'scheme',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['updateNode'],
			},
		},
		default: '',
		description: 'Connection scheme',
	},
	{
		displayName: 'Memory',
		name: 'memory',
		type: 'number',
		required: false,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['updateNode'],
			},
		},
		default: 0,
		description: 'Total memory in MB',
	},
	{
		displayName: 'Disk',
		name: 'disk',
		type: 'number',
		required: false,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['updateNode'],
			},
		},
		default: 0,
		description: 'Total disk space in MB',
	}
];

export async function updateNode(this: IExecuteFunctions, index: number): Promise<any> {
	const nodeId = this.getNodeParameter('nodeId', index) as number;
	const name = this.getNodeParameter('name', index) as string;
	const fqdn = this.getNodeParameter('fqdn', index) as string;
	const scheme = this.getNodeParameter('scheme', index) as string;
	const memory = this.getNodeParameter('memory', index) as number;
	const disk = this.getNodeParameter('disk', index) as number;
	const response = await pterodactylApiRequest.call(
		this,
		'PATCH',
		'/api/application',
		`/nodes/${nodeId}`,
		{ ...(name && { name }), ...(fqdn && { fqdn }), ...(scheme && { scheme }), ...(memory && { memory }), ...(disk && { disk }) },
		{},
		{},
		index,
	);
	return response;
}
