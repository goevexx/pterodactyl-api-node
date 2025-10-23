import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const getNestEggOperation: INodeProperties[] = [
	{
		displayName: 'Nest ID',
		name: 'nestId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['nest'],
				operation: ['getEgg'],
			},
		},
		default: 1,
		description: 'ID of the nest',
	},
	{
		displayName: 'Egg ID',
		name: 'eggId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['nest'],
				operation: ['getEgg'],
			},
		},
		default: 1,
		description: 'ID of the egg to retrieve',
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
	return response.attributes || response;
}
