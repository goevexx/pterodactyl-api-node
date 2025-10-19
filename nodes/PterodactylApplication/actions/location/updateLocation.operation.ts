import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const updateLocationOperation: INodeProperties[] = [
	{
		displayName: 'Location Id',
		name: 'locationId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['location'],
				operation: ['updateLocation'],
			},
		},
		default: 0,
		description: 'ID of the location',
	},
	{
		displayName: 'Short',
		name: 'short',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['location'],
				operation: ['updateLocation'],
			},
		},
		default: '',
		description: 'Short code',
	},
	{
		displayName: 'Long',
		name: 'long',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['location'],
				operation: ['updateLocation'],
			},
		},
		default: '',
		description: 'Long description',
	}
];

export async function updateLocation(this: IExecuteFunctions, index: number): Promise<any> {
	const locationId = this.getNodeParameter('locationId', index) as number;
	const short = this.getNodeParameter('short', index) as string;
	const long = this.getNodeParameter('long', index) as string;
	const response = await pterodactylApiRequest.call(
		this,
		'PATCH',
		'/api/application',
		`/locations/${locationId}`,
		{ ...(short && { short }), ...(long && { long }) },
		{},
		{},
		index,
	);
	return response;
}
