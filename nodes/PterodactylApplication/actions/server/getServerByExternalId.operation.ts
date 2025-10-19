import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const getServerByExternalIdOperation: INodeProperties[] = [
	{
		displayName: 'External Id',
		name: 'externalId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['getServerByExternalId'],
			},
		},
		default: '',
		description: 'External ID of the server',
	}
];

export async function getServerByExternalId(this: IExecuteFunctions, index: number): Promise<any> {
	const externalId = this.getNodeParameter('externalId', index) as string;
	const response = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/application',
		`/servers/external/${externalId}`,
		{},
		{},
		{},
		index,
	);
	return response;
}
