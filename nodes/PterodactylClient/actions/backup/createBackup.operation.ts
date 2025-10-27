import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const createBackupOperation: INodeProperties[] = [
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
				resource: ['backup'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Select the server to create backup for',
	},
	{
		displayName: 'Backup Name',
		name: 'name',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['backup'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'my-backup',
		description: 'Optional backup name (auto-generated if not provided)',
	},
	{
		displayName: 'Ignored Files',
		name: 'ignored',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['backup'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: '*.log,cache/*',
		description: 'Comma-separated list of file patterns to exclude from backup',
	},
	{
		displayName: 'Lock Backup',
		name: 'isLocked',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['backup'],
				operation: ['create'],
			},
		},
		default: false,
		description: 'Whether to lock backup to prevent accidental deletion',
	},
];

export async function createBackup(this: IExecuteFunctions, index: number): Promise<any> {
	// Verify Client API credentials are configured
	try {
		await this.getCredentials('pterodactylClientApi', index);
	} catch {
		throw new Error(
			'Create Backup operation requires Client API credentials. Please configure and select Client API credentials.',
		);
	}

	const serverId = this.getNodeParameter('serverId', index) as string;
	const name = this.getNodeParameter('name', index, '') as string;
	const ignoredStr = this.getNodeParameter('ignored', index, '') as string;
	const isLocked = this.getNodeParameter('isLocked', index) as boolean;

	const body: any = {};
	if (name) body.name = name;
	if (ignoredStr) body.ignored = ignoredStr;
	if (isLocked) body.is_locked = isLocked;

	const response = await pterodactylApiRequest.call(
		this,
		'POST',
		'/api/client',
		`/servers/${serverId}/backups`,
		body,
		{},
		{},
		index,
	);
	return response;
}
