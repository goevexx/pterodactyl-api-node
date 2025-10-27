import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const getLocationOperation: INodeProperties[] = [
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
				operation: ['get'],
			},
		},
		default: '',
		description: 'The location to retrieve',
	},
];

export async function getLocation(this: IExecuteFunctions, index: number): Promise<any> {
	const locationId = this.getNodeParameter('locationId', index) as number;
	const response = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/application',
		`/locations/${locationId}`,
		{},
		{},
		{},
		index,
	);
	return response.attributes || response;
}
