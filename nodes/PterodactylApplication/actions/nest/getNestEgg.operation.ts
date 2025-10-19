import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const getNestEggOperation: INodeProperties[] = [
	{
		displayName: 'Nest Id',
		name: 'nestId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['nest'],
				operation: ['getNestEgg'],
			},
		},
		default: 0,
		description: 'ID of the nest',
	},
	{
		displayName: 'Egg Id',
		name: 'eggId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['nest'],
				operation: ['getNestEgg'],
			},
		},
		default: 0,
		description: 'ID of the egg',
	}
];

export async function getNestEgg(this: IExecuteFunctions, index: number): Promise<any> {
	const nestId = this.getNodeParameter('nestId', index) as number;
	const eggId = this.getNodeParameter('eggId', index) as number;
	const response = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/application',
		`/nests/${nestId}/eggs/${eggId}`,
		{},
		{},
		{},
		index,
	);
	return response;
}
