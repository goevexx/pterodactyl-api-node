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
import {
	listSchedules,
	listSchedulesOperation,
	getSchedule,
	getScheduleOperation,
	createSchedule,
	createScheduleOperation,
	updateSchedule,
	updateScheduleOperation,
	deleteSchedule,
	deleteScheduleOperation,
	executeSchedule,
	executeScheduleOperation,
	createTask,
	createTaskOperation,
	updateTask,
	updateTaskOperation,
	deleteTask,
	deleteTaskOperation,
} from './actions/schedule';
import {
	listAllocations,
	listAllocationsOperation,
	assignAllocation,
	assignAllocationOperation,
	setPrimary,
	setPrimaryOperation,
	deleteAllocation,
	deleteAllocationOperation,
	updateNotes,
	updateNotesOperation,
} from './actions/network';
import {
	listSubusers,
	listSubusersOperation,
	createSubuser,
	createSubuserOperation,
	getSubuser,
	getSubuserOperation,
	updateSubuser,
	updateSubuserOperation,
	deleteSubuser,
	deleteSubuserOperation,
} from './actions/subuser';
import {
	getStartupVariables,
	getStartupVariablesOperation,
	updateStartupVariable,
	updateStartupVariableOperation,
} from './actions/startup';

export class PterodactylClient implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Pterodactyl Client',
		name: 'pterodactylClient',
		icon: 'file:pterodactylClient.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'User-level server management with Pterodactyl Panel Client API',
		defaults: {
			name: 'Pterodactyl Client',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'pterodactylClientApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Account',
						value: 'account',
						description: 'Manage account settings',
					},
					{
						name: 'Backup',
						value: 'backup',
						description: 'Manage server backups',
					},
					{
						name: 'Database',
						value: 'database',
						description: 'Manage server databases',
					},
					{
						name: 'File',
						value: 'file',
						description: 'Manage server files',
					},
					{
						name: 'Network',
						value: 'network',
						description: 'Manage network allocations',
					},
					{
						name: 'Schedule',
						value: 'schedule',
						description: 'Manage server schedules and tasks',
					},
					{
						name: 'Server',
						value: 'server',
						description: 'Manage game servers',
					},
					{
						name: 'Startup',
						value: 'startup',
						description: 'Manage startup variables',
					},
					{
						name: 'Subuser',
						value: 'subuser',
						description: 'Manage server subusers',
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
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['schedule'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'List all schedules for a server',
						action: 'List schedules',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get schedule details',
						action: 'Get a schedule',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new schedule',
						action: 'Create schedule',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a schedule',
						action: 'Update schedule',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a schedule',
						action: 'Delete schedule',
					},
					{
						name: 'Execute',
						value: 'execute',
						description: 'Execute a schedule now',
						action: 'Execute schedule',
					},
					{
						name: 'Create Task',
						value: 'createTask',
						description: 'Create a schedule task',
						action: 'Create task',
					},
					{
						name: 'Update Task',
						value: 'updateTask',
						description: 'Update a schedule task',
						action: 'Update task',
					},
					{
						name: 'Delete Task',
						value: 'deleteTask',
						description: 'Delete a schedule task',
						action: 'Delete task',
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
						resource: ['network'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'listAllocations',
						description: 'List network allocations',
						action: 'List allocations',
					},
					{
						name: 'Assign',
						value: 'assignAllocation',
						description: 'Assign a new allocation',
						action: 'Assign allocation',
					},
					{
						name: 'Set Primary',
						value: 'setPrimary',
						description: 'Set allocation as primary',
						action: 'Set primary',
					},
					{
						name: 'Update Notes',
						value: 'updateNotes',
						description: 'Update allocation notes',
						action: 'Update notes',
					},
					{
						name: 'Delete',
						value: 'deleteAllocation',
						description: 'Delete an allocation',
						action: 'Delete allocation',
					},
				],
				default: 'listAllocations',
				description: 'The operation to perform',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['subuser'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'listSubusers',
						description: 'List server subusers',
						action: 'List subusers',
					},
					{
						name: 'Get',
						value: 'getSubuser',
						description: 'Get subuser details',
						action: 'Get subuser',
					},
					{
						name: 'Create',
						value: 'createSubuser',
						description: 'Create a subuser',
						action: 'Create subuser',
					},
					{
						name: 'Update',
						value: 'updateSubuser',
						description: 'Update subuser permissions',
						action: 'Update subuser',
					},
					{
						name: 'Delete',
						value: 'deleteSubuser',
						description: 'Delete a subuser',
						action: 'Delete subuser',
					},
				],
				default: 'listSubusers',
				description: 'The operation to perform',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['startup'],
					},
				},
				options: [
					{
						name: 'Get Variables',
						value: 'getStartupVariables',
						description: 'Get startup variables',
						action: 'Get variables',
					},
					{
						name: 'Update Variable',
						value: 'updateStartupVariable',
						description: 'Update a startup variable',
						action: 'Update variable',
					},
				],
				default: 'getStartupVariables',
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
			...listSchedulesOperation,
			...getScheduleOperation,
			...createScheduleOperation,
			...updateScheduleOperation,
			...deleteScheduleOperation,
			...executeScheduleOperation,
			...createTaskOperation,
			...updateTaskOperation,
			...deleteTaskOperation,
			...listAllocationsOperation,
			...assignAllocationOperation,
			...setPrimaryOperation,
			...deleteAllocationOperation,
			...updateNotesOperation,
			...listSubusersOperation,
			...createSubuserOperation,
			...getSubuserOperation,
			...updateSubuserOperation,
			...deleteSubuserOperation,
			...getStartupVariablesOperation,
			...updateStartupVariableOperation,
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
				} else if (resource === 'schedule') {
					if (operation === 'list') {
						responseData = await listSchedules.call(this, i);
					} else if (operation === 'get') {
						responseData = await getSchedule.call(this, i);
					} else if (operation === 'create') {
						responseData = await createSchedule.call(this, i);
					} else if (operation === 'update') {
						responseData = await updateSchedule.call(this, i);
					} else if (operation === 'delete') {
						responseData = await deleteSchedule.call(this, i);
					} else if (operation === 'execute') {
						responseData = await executeSchedule.call(this, i);
					} else if (operation === 'createTask') {
						responseData = await createTask.call(this, i);
					} else if (operation === 'updateTask') {
						responseData = await updateTask.call(this, i);
					} else if (operation === 'deleteTask') {
						responseData = await deleteTask.call(this, i);
					}
				} else if (resource === 'network') {
					if (operation === 'listAllocations') {
						responseData = await listAllocations.call(this, i);
					} else if (operation === 'assignAllocation') {
						responseData = await assignAllocation.call(this, i);
					} else if (operation === 'setPrimary') {
						responseData = await setPrimary.call(this, i);
					} else if (operation === 'deleteAllocation') {
						responseData = await deleteAllocation.call(this, i);
					} else if (operation === 'updateNotes') {
						responseData = await updateNotes.call(this, i);
					}
				} else if (resource === 'subuser') {
					if (operation === 'listSubusers') {
						responseData = await listSubusers.call(this, i);
					} else if (operation === 'createSubuser') {
						responseData = await createSubuser.call(this, i);
					} else if (operation === 'getSubuser') {
						responseData = await getSubuser.call(this, i);
					} else if (operation === 'updateSubuser') {
						responseData = await updateSubuser.call(this, i);
					} else if (operation === 'deleteSubuser') {
						responseData = await deleteSubuser.call(this, i);
					}
				} else if (resource === 'startup') {
					if (operation === 'getStartupVariables') {
						responseData = await getStartupVariables.call(this, i);
					} else if (operation === 'updateStartupVariable') {
						responseData = await updateStartupVariable.call(this, i);
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
