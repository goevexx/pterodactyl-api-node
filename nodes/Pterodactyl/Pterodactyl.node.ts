import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import {
	listServers,
	listServersOperation,
	getServer,
	getServerOperation,
	powerAction,
	powerActionOperation,
	sendCommand,
	sendCommandOperation,
	getResources,
	getResourcesOperation,
} from './actions/server';
import {
	listFiles,
	listFilesOperation,
	readFile,
	readFileOperation,
	writeFile,
	writeFileOperation,
	deleteFile,
	deleteFileOperation,
	compressFiles,
	compressFilesOperation,
	decompressFile,
	decompressFileOperation,
	createFolder,
	createFolderOperation,
	getUploadUrl,
	getUploadUrlOperation,
} from './actions/file';
import {
	listDatabases,
	listDatabasesOperation,
	createDatabase,
	createDatabaseOperation,
	rotatePassword,
	rotatePasswordOperation,
	deleteDatabase,
	deleteDatabaseOperation,
} from './actions/database';
import {
	listBackups,
	listBackupsOperation,
	createBackup,
	createBackupOperation,
	getBackup,
	getBackupOperation,
	downloadBackup,
	downloadBackupOperation,
	deleteBackup,
	deleteBackupOperation,
	restoreBackup,
	restoreBackupOperation,
} from './actions/backup';
import {
	getAccount,
	getAccountOperation,
	updateEmail,
	updateEmailOperation,
	updatePassword,
	updatePasswordOperation,
	listApiKeys,
	listApiKeysOperation,
	createApiKey,
	createApiKeyOperation,
	deleteApiKey,
	deleteApiKeyOperation,
} from './actions/account';

export class Pterodactyl implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Pterodactyl',
		name: 'pterodactyl',
		icon: 'file:pterodactyl.svg',
		group: ['transform'],
		version: 2,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Pterodactyl Panel API',
		defaults: {
			name: 'Pterodactyl',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'pterodactylClientApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['clientApi'],
					},
				},
			},
			{
				name: 'pterodactylApplicationApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['applicationApi'],
					},
				},
			},
		],
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'Client API',
						value: 'clientApi',
						description: 'User-level API access',
					},
					{
						name: 'Application API',
						value: 'applicationApi',
						description: 'Admin-level API access',
					},
				],
				default: 'clientApi',
				description: 'The type of API authentication to use',
			},
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Server',
						value: 'server',
						description: 'Manage game servers',
					},
					{
						name: 'File',
						value: 'file',
						description: 'Manage server files',
					},
					{
						name: 'Database',
						value: 'database',
						description: 'Manage server databases',
					},
					{
						name: 'Backup',
						value: 'backup',
						description: 'Manage server backups',
					},
					{
						name: 'Account',
						value: 'account',
						description: 'Manage account settings',
					},
				],
				default: 'server',
				description: 'The resource to operate on',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['server'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'Get all accessible servers',
						action: 'List servers',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get server details',
						action: 'Get a server',
					},
					{
						name: 'Power Action',
						value: 'power',
						description: 'Send power action to server',
						action: 'Power action on server',
					},
					{
						name: 'Send Command',
						value: 'sendCommand',
						description: 'Execute command on server console',
						action: 'Send command to server',
					},
					{
						name: 'Get Resources',
						value: 'getResources',
						description: 'Get server resource usage',
						action: 'Get server resources',
					},
				],
				default: 'list',
				description: 'The operation to perform',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['file'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'List files in directory',
						action: 'List files',
					},
					{
						name: 'Read',
						value: 'read',
						description: 'Read file contents',
						action: 'Read file',
					},
					{
						name: 'Write',
						value: 'write',
						description: 'Write file contents',
						action: 'Write file',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete files',
						action: 'Delete files',
					},
					{
						name: 'Compress',
						value: 'compress',
						description: 'Compress files into archive',
						action: 'Compress files',
					},
					{
						name: 'Decompress',
						value: 'decompress',
						description: 'Extract archive contents',
						action: 'Decompress file',
					},
					{
						name: 'Create Folder',
						value: 'createFolder',
						description: 'Create a new directory',
						action: 'Create folder',
					},
					{
						name: 'Get Upload URL',
						value: 'getUploadUrl',
						description: 'Get signed URL for file upload',
						action: 'Get upload URL',
					},
				],
				default: 'list',
				description: 'The operation to perform',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['database'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'List all databases',
						action: 'List databases',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new database',
						action: 'Create database',
					},
					{
						name: 'Rotate Password',
						value: 'rotatePassword',
						description: 'Rotate database password',
						action: 'Rotate database password',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a database',
						action: 'Delete database',
					},
				],
				default: 'list',
				description: 'The operation to perform',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['backup'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'List all backups',
						action: 'List backups',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new backup',
						action: 'Create backup',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get backup details',
						action: 'Get backup',
					},
					{
						name: 'Download',
						value: 'download',
						description: 'Get backup download URL',
						action: 'Download backup',
					},
					{
						name: 'Restore',
						value: 'restore',
						description: 'Restore backup to server',
						action: 'Restore backup',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a backup',
						action: 'Delete backup',
					},
				],
				default: 'list',
				description: 'The operation to perform',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['account'],
					},
				},
				options: [
					{
						name: 'Get Account',
						value: 'getAccount',
						description: 'Get account details',
						action: 'Get account',
					},
					{
						name: 'Update Email',
						value: 'updateEmail',
						description: 'Update email address',
						action: 'Update email',
					},
					{
						name: 'Update Password',
						value: 'updatePassword',
						description: 'Change account password',
						action: 'Update password',
					},
					{
						name: 'List API Keys',
						value: 'listApiKeys',
						description: 'List all API keys',
						action: 'List API keys',
					},
					{
						name: 'Create API Key',
						value: 'createApiKey',
						description: 'Create a new API key',
						action: 'Create API key',
					},
					{
						name: 'Delete API Key',
						value: 'deleteApiKey',
						description: 'Delete an API key',
						action: 'Delete API key',
					},
				],
				default: 'getAccount',
				description: 'The operation to perform',
			},
			...listServersOperation,
			...getServerOperation,
			...powerActionOperation,
			...sendCommandOperation,
			...getResourcesOperation,
			...listFilesOperation,
			...readFileOperation,
			...writeFileOperation,
			...deleteFileOperation,
			...compressFilesOperation,
			...decompressFileOperation,
			...createFolderOperation,
			...getUploadUrlOperation,
			...listDatabasesOperation,
			...createDatabaseOperation,
			...rotatePasswordOperation,
			...deleteDatabaseOperation,
			...listBackupsOperation,
			...createBackupOperation,
			...getBackupOperation,
			...downloadBackupOperation,
			...deleteBackupOperation,
			...restoreBackupOperation,
			...getAccountOperation,
			...updateEmailOperation,
			...updatePasswordOperation,
			...listApiKeysOperation,
			...createApiKeyOperation,
			...deleteApiKeyOperation,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: any;

				if (resource === 'server') {
					if (operation === 'list') {
						responseData = await listServers.call(this, i);
					} else if (operation === 'get') {
						responseData = await getServer.call(this, i);
					} else if (operation === 'power') {
						responseData = await powerAction.call(this, i);
					} else if (operation === 'sendCommand') {
						responseData = await sendCommand.call(this, i);
					} else if (operation === 'getResources') {
						responseData = await getResources.call(this, i);
					}
				} else if (resource === 'file') {
					if (operation === 'list') {
						responseData = await listFiles.call(this, i);
					} else if (operation === 'read') {
						responseData = await readFile.call(this, i);
					} else if (operation === 'write') {
						responseData = await writeFile.call(this, i);
					} else if (operation === 'delete') {
						responseData = await deleteFile.call(this, i);
					} else if (operation === 'compress') {
						responseData = await compressFiles.call(this, i);
					} else if (operation === 'decompress') {
						responseData = await decompressFile.call(this, i);
					} else if (operation === 'createFolder') {
						responseData = await createFolder.call(this, i);
					} else if (operation === 'getUploadUrl') {
						responseData = await getUploadUrl.call(this, i);
					}
				} else if (resource === 'database') {
					if (operation === 'list') {
						responseData = await listDatabases.call(this, i);
					} else if (operation === 'create') {
						responseData = await createDatabase.call(this, i);
					} else if (operation === 'rotatePassword') {
						responseData = await rotatePassword.call(this, i);
					} else if (operation === 'delete') {
						responseData = await deleteDatabase.call(this, i);
					}
				} else if (resource === 'backup') {
					if (operation === 'list') {
						responseData = await listBackups.call(this, i);
					} else if (operation === 'create') {
						responseData = await createBackup.call(this, i);
					} else if (operation === 'get') {
						responseData = await getBackup.call(this, i);
					} else if (operation === 'download') {
						responseData = await downloadBackup.call(this, i);
					} else if (operation === 'restore') {
						responseData = await restoreBackup.call(this, i);
					} else if (operation === 'delete') {
						responseData = await deleteBackup.call(this, i);
					}
				} else if (resource === 'account') {
					if (operation === 'getAccount') {
						responseData = await getAccount.call(this, i);
					} else if (operation === 'updateEmail') {
						responseData = await updateEmail.call(this, i);
					} else if (operation === 'updatePassword') {
						responseData = await updatePassword.call(this, i);
					} else if (operation === 'listApiKeys') {
						responseData = await listApiKeys.call(this, i);
					} else if (operation === 'createApiKey') {
						responseData = await createApiKey.call(this, i);
					} else if (operation === 'deleteApiKey') {
						responseData = await deleteApiKey.call(this, i);
					}
				}

				if (Array.isArray(responseData)) {
					returnData.push(...responseData.map((item) => ({ json: item })));
				} else {
					returnData.push({ json: responseData });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
