import {
	IAuthenticateGeneric,
	ICredentialType,
	INodeProperties,
	ICredentialTestRequest,
} from 'n8n-workflow';

export class PterodactylApplicationApi implements ICredentialType {
	name = 'pterodactylApplicationApi';
	displayName = 'Pterodactyl Application API';
	documentationUrl = 'https://pterodactyl.io/api/';
	properties: INodeProperties[] = [
		{
			displayName: 'Panel URL',
			name: 'panelUrl',
			type: 'string',
			default: '',
			placeholder: 'https://panel.example.com',
			required: true,
			description: 'The base URL of your Pterodactyl Panel (without trailing slash)',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Application API key starting with ptla_',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
				Accept: 'application/vnd.pterodactyl.v1+json',
				'Content-Type': 'application/json',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.panelUrl}}',
			url: '/api/application/users',
			method: 'GET',
		},
	};
}
