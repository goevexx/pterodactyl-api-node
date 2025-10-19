import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const createNodeAllocationsOperation: INodeProperties[] = [
	{
		displayName: 'Node Id',
		name: 'nodeId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['createNodeAllocations'],
			},
		},
		default: 0,
		description: 'ID of the node',
	},
	{
		displayName: 'Ip',
		name: 'ip',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['createNodeAllocations'],
			},
		},
		default: '',
		description: 'IP address',
	},
	{
		displayName: 'Ports',
		name: 'ports',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['createNodeAllocations'],
			},
		},
		default: '',
		description: 'Comma-separated list of ports (e.g., 25565,25566-25570)',
	}
];

export async function createNodeAllocations(this: IExecuteFunctions, index: number): Promise<any> {
	const nodeId = this.getNodeParameter('nodeId', index) as number;
	const ip = this.getNodeParameter('ip', index) as string;
	const ports = this.getNodeParameter('ports', index) as string;
	const response = await pterodactylApiRequest.call(
		this,
		'POST',
		'/api/application',
		`/nodes/${nodeId}/allocations`,
		{ ip, ports: ports.split(',') },
		{},
		{},
		index,
	);
	return response;
}
