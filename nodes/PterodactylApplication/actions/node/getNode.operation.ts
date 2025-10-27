import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const getNodeOperation: INodeProperties[] = [
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
				operation: ['get'],
			},
		},
		default: '',
		description: 'The node to retrieve',
	},
];

export async function getNode(this: IExecuteFunctions, index: number): Promise<any> {
	const nodeId = this.getNodeParameter('nodeId', index) as number;
	const response = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/application',
		`/nodes/${nodeId}`,
		{},
		{},
		{},
		index,
	);
	return response.attributes || response;
}
