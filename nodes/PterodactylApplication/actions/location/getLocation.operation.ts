import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const getLocationOperation: INodeProperties[] = [
	{
		displayName: 'Location Id',
		name: 'locationId',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['location'],
				operation: ['getLocation'],
			},
		},
		default: 0,
		description: 'ID of the location',
	}
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
	return response;
}
