import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const getNodeConfigurationOperation: INodeProperties[] = [
	{
		displayName: 'Node Id',
		name: 'nodeId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['getNodeConfiguration'],
			},
		},
		default: 0,
		description: 'ID of the node',
	}
];

export async function getNodeConfiguration(this: IExecuteFunctions, index: number): Promise<any> {
	const nodeId = this.getNodeParameter('nodeId', index) as number;
	const response = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/application',
		`/nodes/${nodeId}/configuration`,
		{},
		{},
		{},
		index,
	);
	return response;
}
