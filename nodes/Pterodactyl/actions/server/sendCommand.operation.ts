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
		default: '',
		description: 'The unique identifier of the server',
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
	const serverId = this.getNodeParameter('serverId', index) as string;
	const command = this.getNodeParameter('command', index) as string;

	await pterodactylApiRequest.call(this, 'POST', `/servers/${serverId}/command`, {
		command,
	});

	return { success: true, command, serverId };
}
