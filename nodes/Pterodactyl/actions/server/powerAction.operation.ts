import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../transport/PterodactylApiRequest';

export const powerActionOperation: INodeProperties[] = [
	{
		displayName: 'Server Identifier',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['power'],
			},
		},
		placeholder: 'abc12def',
		default: '',
		description:
			'The alphanumeric server identifier from your Pterodactyl Panel (e.g., abc12def). Find this in the server URL or use the List Servers operation. Note: This operation requires Client API credentials.',
	},
	{
		displayName: 'Action',
		name: 'powerAction',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['power'],
			},
		},
		options: [
			{
				name: 'Start',
				value: 'start',
				description: 'Start the server',
			},
			{
				name: 'Stop',
				value: 'stop',
				description: 'Stop the server gracefully',
			},
			{
				name: 'Restart',
				value: 'restart',
				description: 'Restart the server',
			},
			{
				name: 'Kill',
				value: 'kill',
				description: 'Force kill the server',
			},
		],
		default: 'start',
		description: 'The power action to perform',
	},
];

export async function powerAction(this: IExecuteFunctions, index: number): Promise<any> {
	// Verify Client API credentials are configured
	try {
		await this.getCredentials('pterodactylClientApi', index);
	} catch {
		throw new Error(
			'Power Action operation requires Client API credentials. Please configure and select Client API credentials.',
		);
	}

	const serverId = this.getNodeParameter('serverId', index) as string;
	const action = this.getNodeParameter('powerAction', index) as string;

	await pterodactylApiRequest.call(
		this,
		'POST',
		`/servers/${serverId}/power`,
		{
			signal: action,
		},
		{},
		{},
		index,
	);

	return { success: true, action, serverId };
}
