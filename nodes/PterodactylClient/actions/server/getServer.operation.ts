import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const getServerOperation: INodeProperties[] = [
	{
		displayName: 'Server ID',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['get'],
			},
		},
		placeholder: '11 or abc12def',
		default: '',
		description:
			'Application API: numeric server ID (e.g., 11). Client API: alphanumeric identifier (e.g., abc12def).',
	},
];

export async function getServer(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as string;
	const response = await pterodactylApiRequest.call(this, 'GET',
		'/api/client',
		`/servers/${serverId}`, {}, {}, {}, index);
	return response.attributes || response;
}
