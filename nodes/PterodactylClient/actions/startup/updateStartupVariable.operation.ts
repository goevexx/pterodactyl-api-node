import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const updateStartupVariableOperation: INodeProperties[] = [
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
				resource: ['startup'],
				operation: ['updateStartupVariable'],
			},
		},
		default: '',
		description: 'Select the server to update startup variable for',
	},
	{
		displayName: 'Key',
		name: 'key',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['startup'],
				operation: ['updateStartupVariable'],
			},
		},
		default: '',
		description: 'Variable key/name',
	},
	{
		displayName: 'Value',
		name: 'value',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['startup'],
				operation: ['updateStartupVariable'],
			},
		},
		default: '',
		description: 'New value for the variable',
	},
];

export async function updateStartupVariable(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as string;
	const key = this.getNodeParameter('key', index) as string;
	const value = this.getNodeParameter('value', index) as string;

	const response = await pterodactylApiRequest.call(
		this,
		'PUT',
		'/api/client',
		`/servers/${serverId}/startup/variable`,
		{ key, value },
		{},
		{},
		index,
	);
	return response;
}
