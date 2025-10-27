import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const deleteLocationOperation: INodeProperties[] = [
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
				operation: ['delete'],
			},
		},
		default: '',
		description: 'The location to delete',
	},
];

export async function deleteLocation(this: IExecuteFunctions, index: number): Promise<any> {
	const locationId = this.getNodeParameter('locationId', index) as number;
	await pterodactylApiRequest.call(
		this,
		'DELETE',
		'/api/application',
		`/locations/${locationId}`,
		{},
		{},
		{},
		index,
	);
	return {
		success: true,
		locationId,
		action: 'deleted',
	};
}
