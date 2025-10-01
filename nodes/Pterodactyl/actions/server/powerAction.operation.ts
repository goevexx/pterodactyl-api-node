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
		default: '',
		description: 'The unique identifier of the server',
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
	const serverId = this.getNodeParameter('serverId', index) as string;
	const action = this.getNodeParameter('powerAction', index) as string;

	await pterodactylApiRequest.call(this, 'POST', `/servers/${serverId}/power`, {
		signal: action,
	});

	return { success: true, action, serverId };
}
