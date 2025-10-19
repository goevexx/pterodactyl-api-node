import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const rotatePasswordOperation: INodeProperties[] = [
	{
		displayName: 'Server Identifier',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['database'],
				operation: ['rotatePassword'],
			},
		},
		placeholder: 'abc12def',
		default: '',
		description:
			'The alphanumeric server identifier from your Pterodactyl Panel (e.g., abc12def). Find this in the server URL.',
	},
	{
		displayName: 'Database ID',
		name: 'databaseId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['database'],
				operation: ['rotatePassword'],
			},
		},
		default: '',
		description: 'Database identifier to rotate password for',
	},
];

export async function rotatePassword(this: IExecuteFunctions, index: number): Promise<any> {
	// Verify Client API credentials are configured
	try {
		await this.getCredentials('pterodactylClientApi', index);
	} catch {
		throw new Error(
			'Rotate Password operation requires Client API credentials. Please configure and select Client API credentials.',
		);
	}

	const serverId = this.getNodeParameter('serverId', index) as string;
	const databaseId = this.getNodeParameter('databaseId', index) as string;

	const response = await pterodactylApiRequest.call(
		this,
		'POST',
		'/api/client',
		`/servers/${serverId}/databases/${databaseId}/rotate-password`,
	);
	return response;
}
