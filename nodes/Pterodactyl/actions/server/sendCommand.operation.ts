import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../transport/PterodactylApiRequest';

export const sendCommandOperation: INodeProperties[] = [
	{
		displayName: 'Server Identifier',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['sendCommand'],
			},
		},
		placeholder: 'abc12def',
		default: '',
		description:
			'The alphanumeric server identifier from your Pterodactyl Panel (e.g., abc12def). Find this in the server URL or use the List Servers operation. Note: This operation requires Client API authentication.',
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
	const authentication = this.getNodeParameter('authentication', index) as string;

	if (authentication === 'applicationApi') {
		throw new Error(
			'Send Command operation requires Client API authentication. Please use Client API credentials or choose a different operation.',
		);
	}

	const serverId = this.getNodeParameter('serverId', index) as string;
	const command = this.getNodeParameter('command', index) as string;

	await pterodactylApiRequest.call(
		this,
		'POST',
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
