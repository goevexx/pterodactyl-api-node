import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const updateLocationOperation: INodeProperties[] = [
	{
		displayName: 'Location',
		name: 'locationId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getLocations',
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['location'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'The location to update',
	},
	{
		displayName: 'Short Code',
		name: 'short',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['location'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'New short identifier for the location',
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
				operation: ['update'],
			},
		},
		default: '',
		description: 'New detailed description of the location',
		placeholder: 'Data center located on the US East Coast',
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
	return response.attributes || response;
}
