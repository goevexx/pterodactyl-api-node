import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const listNestEggsOperation: INodeProperties[] = [
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
				operation: ['listEggs'],
			},
		},
		default: '',
		description: 'The nest to list eggs from',
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
	// Extract attributes from each object
	return (response.data || []).map((item: any) => item.attributes || item);
}
