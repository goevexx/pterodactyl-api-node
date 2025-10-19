import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const compressFilesOperation: INodeProperties[] = [
	{
		displayName: 'Server Identifier',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['compress'],
			},
		},
		placeholder: 'abc12def',
		default: '',
		description:
			'The alphanumeric server identifier from your Pterodactyl Panel (e.g., abc12def). Find this in the server URL.',
	},
	{
		displayName: 'Root Directory',
		name: 'root',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['compress'],
			},
		},
		default: '/',
		description: 'Parent directory containing files to compress',
	},
	{
		displayName: 'Files',
		name: 'files',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['compress'],
			},
		},
		default: '',
		placeholder: 'world,plugins,config.yml',
		description: 'Comma-separated list of files/directories to compress into archive',
	},
];

export async function compressFiles(this: IExecuteFunctions, index: number): Promise<any> {
	// Verify Client API credentials are configured
	try {
		await this.getCredentials('pterodactylClientApi', index);
	} catch {
		throw new Error(
			'Compress Files operation requires Client API credentials. Please configure and select Client API credentials.',
		);
	}

	const serverId = this.getNodeParameter('serverId', index) as string;
	const root = this.getNodeParameter('root', index) as string;
	const filesStr = this.getNodeParameter('files', index) as string;
	const files = filesStr.split(',').map((f) => f.trim());

	const response = await pterodactylApiRequest.call(
		this,
		'POST',
		'/api/client',
		`/servers/${serverId}/files/compress`,
		{
			root,
			files,
		},
	);
	return response;
}
