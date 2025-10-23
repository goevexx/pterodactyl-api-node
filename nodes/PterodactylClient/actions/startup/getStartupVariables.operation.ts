import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const getStartupVariablesOperation: INodeProperties[] = [
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
				operation: ['getStartupVariables'],
			},
		},
		default: '',
		description: 'Select the server to get startup variables from',
	},
];

export async function getStartupVariables(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as string;

	const response = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/client',
		`/servers/${serverId}/startup`,
		{},
		{},
		{},
		index,
	);
	return response;
}
