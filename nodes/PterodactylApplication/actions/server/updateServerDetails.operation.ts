import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const updateServerDetailsOperation: INodeProperties[] = [
	{
		displayName: 'Server',
		name: 'serverId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getServers',
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateDetails'],
			},
		},
		default: '',
		description: 'The server to update',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateDetails'],
			},
		},
		default: '',
		description: 'Server name. Leave empty to keep current value.',
	},
	{
		displayName: 'Owner User',
		name: 'userId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getUsers',
		},
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateDetails'],
			},
		},
		default: '',
		description: 'The user who will own this server. Leave empty to keep current owner.',
	},
	{
		displayName: 'External ID',
		name: 'externalId',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateDetails'],
			},
		},
		default: '',
		description: 'External ID for integration with other systems. Leave empty to keep current value.',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		typeOptions: {
			rows: 3,
		},
		required: false,
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['updateDetails'],
			},
		},
		default: '',
		description: 'Server description. Leave empty to keep current value.',
	}
];

export async function updateServerDetails(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as number;

	// First, fetch the current server data
	const currentServerResponse = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/application',
		`/servers/${serverId}`,
		{},
		{},
		{},
		index,
	);

	const currentServer = currentServerResponse.attributes;

	// Get user input values (empty string if not provided)
	const nameInput = this.getNodeParameter('name', index, '') as string;
	const userIdInput = this.getNodeParameter('userId', index, '') as string;
	const externalIdInput = this.getNodeParameter('externalId', index, '') as string;
	const descriptionInput = this.getNodeParameter('description', index, '') as string;

	// Use input values OR fall back to current values
	const name = nameInput || currentServer.name;
	const userId = userIdInput || currentServer.user;
	const externalId = externalIdInput !== '' ? externalIdInput : (currentServer.external_id || '');
	const description = descriptionInput !== '' ? descriptionInput : (currentServer.description || '');

	const response = await pterodactylApiRequest.call(
		this,
		'PATCH',
		'/api/application',
		`/servers/${serverId}/details`,
		{
			name,
			user: userId,
			external_id: externalId,
			description,
		},
		{},
		{},
		index,
	);
	return response.attributes || response;
}
