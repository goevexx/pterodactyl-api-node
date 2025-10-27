import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const createLocationOperation: INodeProperties[] = [
	{
		displayName: 'Short Code',
		name: 'short',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['location'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Short identifier for the location (e.g., us-east)',
		placeholder: 'us-east',
	},
	{
		displayName: 'Description',
		name: 'long',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		required: false,
		displayOptions: {
			show: {
				resource: ['location'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Detailed description of the location',
		placeholder: 'Data center located on the US East Coast',
	},
];

export async function createLocation(this: IExecuteFunctions, index: number): Promise<any> {
	const short = this.getNodeParameter('short', index) as string;
	const long = this.getNodeParameter('long', index) as string;
	const response = await pterodactylApiRequest.call(
		this,
		'POST',
		'/api/application',
		`/locations`,
		{ short, ...(long && { long }) },
		{},
		{},
		index,
	);
	return response.attributes || response;
}
