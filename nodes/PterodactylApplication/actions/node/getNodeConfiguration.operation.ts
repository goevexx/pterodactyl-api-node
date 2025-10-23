import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const getNodeConfigurationOperation: INodeProperties[] = [
	{
		displayName: 'Node',
		name: 'nodeId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getNodes',
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['node'],
				operation: ['getConfiguration'],
			},
		},
		default: '',
		description: 'The node to get configuration for',
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
	return response.attributes || response;
}
