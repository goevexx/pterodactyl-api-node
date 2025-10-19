import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const getResourcesOperation: INodeProperties[] = [
	{
		displayName: 'Server Identifier',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['getResources'],
			},
		},
		placeholder: 'abc12def',
		default: '',
		description:
			'The server identifier from your Pterodactyl Panel (e.g., abc12def). Find this in the server URL or use the List Servers operation. Note: This operation requires Client API credentials.',
	},
];

export async function getResources(this: IExecuteFunctions, index: number): Promise<any> {
	// Verify Client API credentials are configured
	try {
		await this.getCredentials('pterodactylClientApi', index);
	} catch {
		throw new Error(
			'Get Resources operation requires Client API credentials. Please configure and select Client API credentials.',
		);
	}

	const serverId = this.getNodeParameter('serverId', index) as string;
	const response = await pterodactylApiRequest.call(this, 'GET',
		'/api/client',
		`/servers/${serverId}/resources`, {}, {}, {}, index);
	return response.attributes || response;
}
