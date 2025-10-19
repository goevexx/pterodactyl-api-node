import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const listNestEggsOperation: INodeProperties[] = [
	{
		displayName: 'Nest Id',
		name: 'nestId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['nest'],
				operation: ['listNestEggs'],
			},
		},
		default: 0,
		description: 'ID of the nest',
	}
];

export async function listNestEggs(this: IExecuteFunctions, index: number): Promise<any> {
	const nestId = this.getNodeParameter('nestId', index) as number;
	const response = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/application',
		`/nests/${nestId}/eggs`,
		{},
		{},
		{},
		index,
	);
	return response.data || [];
}
