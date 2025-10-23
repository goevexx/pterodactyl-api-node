import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const getNestOperation: INodeProperties[] = [
	{
		displayName: 'Nest ID',
		name: 'nestId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['nest'],
				operation: ['getNest'],
			},
		},
		default: 1,
		description: 'ID of the nest to retrieve',
	}
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
