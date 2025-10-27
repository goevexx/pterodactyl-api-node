import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const getNestOperation: INodeProperties[] = [
	{
		displayName: 'Nest',
		name: 'nestId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getNests',
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['nest'],
				operation: ['getNest'],
			},
		},
		default: '',
		description: 'The nest to retrieve',
	},
];

export async function getNest(this: IExecuteFunctions, index: number): Promise<any> {
	const nestId = this.getNodeParameter('nestId', index) as number;
	const response = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/application',
		`/nests/${nestId}`,
		{},
		{},
		{},
		index,
	);
	return response.attributes || response;
}
