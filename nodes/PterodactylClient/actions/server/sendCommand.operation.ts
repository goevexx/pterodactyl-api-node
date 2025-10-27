import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const sendCommandOperation: INodeProperties[] = [
	{
		displayName: 'Server',
		name: 'serverId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getClientServers',
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['sendCommand'],
			},
		},
		default: '',
		description: 'Select the server to send the command to',
	},
	{
		displayName: 'Command',
		name: 'command',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['sendCommand'],
			},
		},
		default: '',
		placeholder: 'say Hello World',
		description: 'The command to execute on the server console',
	},
];

export async function sendCommand(this: IExecuteFunctions, index: number): Promise<any> {
	// Verify Client API credentials are configured
	try {
		await this.getCredentials('pterodactylClientApi', index);
	} catch {
		throw new Error(
			'Send Command operation requires Client API credentials. Please configure and select Client API credentials.',
		);
	}

	const serverId = this.getNodeParameter('serverId', index) as string;
	const command = this.getNodeParameter('command', index) as string;

	await pterodactylApiRequest.call(
		this,
		'POST',
		'/api/client',
		`/servers/${serverId}/command`,
		{
			command,
		},
		{},
		{},
		index,
	);

	return { success: true, command, serverId };
}
