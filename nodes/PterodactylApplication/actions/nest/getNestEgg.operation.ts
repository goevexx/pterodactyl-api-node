import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const getNestEggOperation: INodeProperties[] = [
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
				operation: ['getEgg'],
			},
		},
		default: '',
		description: 'The nest containing the egg',
	},
	{
		displayName: 'Egg',
		name: 'eggId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getEggsForNest',
			loadOptionsDependsOn: ['nestId'],
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['nest'],
				operation: ['getEgg'],
			},
		},
		default: '',
		description: 'The egg to retrieve',
	},
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
