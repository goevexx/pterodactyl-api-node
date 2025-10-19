import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const listBackupsOperation: INodeProperties[] = [
	{
		displayName: 'Server Identifier',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['backup'],
				operation: ['list'],
			},
		},
		placeholder: 'abc12def',
		default: '',
		description:
			'The alphanumeric server identifier from your Pterodactyl Panel (e.g., abc12def). Find this in the server URL.',
	},
];

export async function listBackups(this: IExecuteFunctions, index: number): Promise<any> {
	// Verify Client API credentials are configured
	try {
		await this.getCredentials('pterodactylClientApi', index);
	} catch {
		throw new Error(
			'List Backups operation requires Client API credentials. Please configure and select Client API credentials.',
		);
	}

	const serverId = this.getNodeParameter('serverId', index) as string;

	const response = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/client',
		`/servers/${serverId}/backups`,
		{},
		{},
		{},
		index,
	);
	return response.data || [];
}
