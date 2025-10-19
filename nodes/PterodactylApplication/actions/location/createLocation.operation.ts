import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const createLocationOperation: INodeProperties[] = [
	{
		displayName: 'Short',
		name: 'short',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['location'],
				operation: ['createLocation'],
			},
		},
		default: '',
		description: 'Short code (e.g., us-east)',
	},
	{
		displayName: 'Long',
		name: 'long',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['location'],
				operation: ['createLocation'],
			},
		},
		default: '',
		description: 'Long description (e.g., US East)',
	}
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
	return response;
}
