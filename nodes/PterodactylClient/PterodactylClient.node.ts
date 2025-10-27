import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
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
	listScheduleTasks,
	listScheduleTasksOperation,
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
	getSubuser,
	getSubuserOperation,
	createSubuser,
	createSubuserOperation,
	updateSubuser,
	updateSubuserOperation,
	deleteSubuser,
	deleteSubuserOperation,
	getPermissions,
	getPermissionsOperation,
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
						description: 'Send console command to server',
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
						action: 'Read a file',
					},
					{
						name: 'Write',
						value: 'write',
						description: 'Write file contents',
						action: 'Write a file',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a file or directory',
						action: 'Delete a file',
					},
					{
						name: 'Compress',
						value: 'compress',
						description: 'Compress files',
						action: 'Compress files',
					},
					{
						name: 'Decompress',
						value: 'decompress',
						description: 'Decompress an archive',
						action: 'Decompress files',
					},
					{
						name: 'Create Folder',
						value: 'createFolder',
						description: 'Create a new folder',
						action: 'Create a folder',
					},
					{
						name: 'Get Upload URL',
						value: 'getUploadUrl',
						description: 'Get file upload URL',
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
						action: 'Create a database',
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
						action: 'Delete a database',
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
						action: 'Create a backup',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get backup details',
						action: 'Get a backup',
					},
					{
						name: 'Download',
						value: 'download',
						description: 'Get backup download URL',
						action: 'Download a backup',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a backup',
						action: 'Delete a backup',
					},
					{
						name: 'Restore',
						value: 'restore',
						description: 'Restore from backup',
						action: 'Restore a backup',
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
						name: 'Get',
						value: 'get',
						description: 'Get account details',
						action: 'Get account',
					},
					{
						name: 'Update Email',
						value: 'updateEmail',
						description: 'Update account email',
						action: 'Update email',
					},
					{
						name: 'Update Password',
						value: 'updatePassword',
						description: 'Update account password',
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
				default: 'get',
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
						description: 'List all schedules',
						action: 'List schedules',
					},
					{
						name: 'List Tasks',
						value: 'listTasks',
						description: 'List tasks for a schedule',
						action: 'List schedule tasks',
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
						action: 'Create a schedule',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a schedule',
						action: 'Update a schedule',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a schedule',
						action: 'Delete a schedule',
					},
					{
						name: 'Execute',
						value: 'execute',
						description: 'Execute a schedule now',
						action: 'Execute a schedule',
					},
					{
						name: 'Create Task',
						value: 'createTask',
						description: 'Create a new task',
						action: 'Create a task',
					},
					{
						name: 'Update Task',
						value: 'updateTask',
						description: 'Update a task',
						action: 'Update a task',
					},
					{
						name: 'Delete Task',
						value: 'deleteTask',
						description: 'Delete a task',
						action: 'Delete a task',
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
						value: 'list',
						description: 'List all allocations',
						action: 'List allocations',
					},
					{
						name: 'Assign',
						value: 'assign',
						description: 'Assign an allocation',
						action: 'Assign allocation',
					},
					{
						name: 'Set Primary',
						value: 'setPrimary',
						description: 'Set primary allocation',
						action: 'Set primary allocation',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete an allocation',
						action: 'Delete allocation',
					},
					{
						name: 'Update Notes',
						value: 'updateNotes',
						description: 'Update allocation notes',
						action: 'Update allocation notes',
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
						resource: ['subuser'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'List all subusers',
						action: 'List subusers',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get subuser details',
						action: 'Get a subuser',
					},
					{
						name: 'Create',
						value: 'createSubuser',
						description: 'Create a new subuser',
						action: 'Create a subuser',
					},
					{
						name: 'Update',
						value: 'updateSubuser',
						description: 'Update subuser permissions',
						action: 'Update a subuser',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a subuser',
						action: 'Delete a subuser',
					},
					{
						name: 'Get Permissions',
						value: 'getPermissions',
						description: 'Get available permissions',
						action: 'Get permissions',
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
			...listScheduleTasksOperation,
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
			...getPermissionsOperation,
			...getStartupVariablesOperation,
			...updateStartupVariableOperation,
		],
	};

	methods = {
		loadOptions: {
			async getClientServers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const { pterodactylApiRequest } = await import('../../shared/transport');
					const response = await pterodactylApiRequest.call(
						this as unknown as IExecuteFunctions,
						'GET',
						'/api/client',
						'',
						{},
						{},
						{},
						0,
					);

					const servers = response.data || [];

					if (servers.length === 0) {
						return [
							{
								name: 'No servers found',
								value: '',
							},
						];
					}

					return servers.map((server: any) => ({
						name: `${server.attributes.name} - ${server.attributes.identifier}`,
						value: server.attributes.identifier,
					}));
				} catch (error) {
					console.error('Error fetching client servers:', error);
					return [
						{
							name: `Error: ${(error as Error).message}`,
							value: '',
						},
					];
				}
			},

			async getBackupsForServer(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const serverId = this.getCurrentNodeParameter('serverId') as string;

					if (!serverId) {
						return [];
					}

					const { pterodactylApiRequest } = await import('../../shared/transport');
					const response = await pterodactylApiRequest.call(
						this as unknown as IExecuteFunctions,
						'GET',
						'/api/client',
						`/servers/${serverId}/backups`,
						{},
						{},
						{},
						0,
					);

					const backups = response.data || [];

					if (backups.length === 0) {
						return [
							{
								name: 'No backups found for this server',
								value: '',
							},
						];
					}

					return backups.map((backup: any) => ({
						name: `${backup.attributes.name} - ${backup.attributes.created_at} (UUID: ${backup.attributes.uuid})`,
						value: backup.attributes.uuid,
					}));
				} catch (error) {
					console.error('Error fetching backups:', error);
					return [
						{
							name: `Error: ${(error as Error).message}`,
							value: '',
						},
					];
				}
			},

			async getDatabasesForServer(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const serverId = this.getCurrentNodeParameter('serverId') as string;

					if (!serverId) {
						return [];
					}

					const { pterodactylApiRequest } = await import('../../shared/transport');
					const response = await pterodactylApiRequest.call(
						this as unknown as IExecuteFunctions,
						'GET',
						'/api/client',
						`/servers/${serverId}/databases`,
						{},
						{},
						{},
						0,
					);

					const databases = response.data || [];

					if (databases.length === 0) {
						return [
							{
								name: 'No databases found for this server',
								value: '',
							},
						];
					}

					return databases.map((database: any) => ({
						name: `${database.attributes.name} (ID: ${database.attributes.id})`,
						value: database.attributes.id,
					}));
				} catch (error) {
					console.error('Error fetching databases:', error);
					return [
						{
							name: `Error: ${(error as Error).message}`,
							value: '',
						},
					];
				}
			},

			async getSchedulesForServer(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const serverId = this.getCurrentNodeParameter('serverId') as string;

					if (!serverId) {
						return [];
					}

					const { pterodactylApiRequest } = await import('../../shared/transport');
					const response = await pterodactylApiRequest.call(
						this as unknown as IExecuteFunctions,
						'GET',
						'/api/client',
						`/servers/${serverId}/schedules`,
						{},
						{},
						{},
						0,
					);

					const schedules = response.data || [];

					if (schedules.length === 0) {
						return [
							{
								name: 'No schedules found for this server',
								value: '',
							},
						];
					}

					return schedules.map((schedule: any) => ({
						name: `${schedule.attributes.name} (ID: ${schedule.attributes.id})`,
						value: schedule.attributes.id,
					}));
				} catch (error) {
					console.error('Error fetching schedules:', error);
					return [
						{
							name: `Error: ${(error as Error).message}`,
							value: '',
						},
					];
				}
			},

			async getTasksForSchedule(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const serverId = this.getCurrentNodeParameter('serverId') as string;
					const scheduleId = this.getCurrentNodeParameter('scheduleId') as string;

					if (!serverId || !scheduleId) {
						return [];
					}

					const { pterodactylApiRequest } = await import('../../shared/transport');
					const response = await pterodactylApiRequest.call(
						this as unknown as IExecuteFunctions,
						'GET',
						'/api/client',
						`/servers/${serverId}/schedules/${scheduleId}`,
						{},
						{},
						{},
						0,
					);

					const tasks = response.attributes?.relationships?.tasks?.data || [];

					if (tasks.length === 0) {
						return [
							{
								name: 'No tasks found for this schedule',
								value: '',
							},
						];
					}

					return tasks.map((task: any) => ({
						name: `${task.attributes.action} - ${task.attributes.payload} (ID: ${task.attributes.id})`,
						value: task.attributes.id,
					}));
				} catch (error) {
					console.error('Error fetching tasks:', error);
					return [
						{
							name: `Error: ${(error as Error).message}`,
							value: '',
						},
					];
				}
			},

			async getAllocationsForServer(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const serverId = this.getCurrentNodeParameter('serverId') as string;

					if (!serverId) {
						return [];
					}

					const { pterodactylApiRequest } = await import('../../shared/transport');
					const response = await pterodactylApiRequest.call(
						this as unknown as IExecuteFunctions,
						'GET',
						'/api/client',
						`/servers/${serverId}/network/allocations`,
						{},
						{},
						{},
						0,
					);

					const allocations = response.data || [];

					if (allocations.length === 0) {
						return [
							{
								name: 'No allocations found for this server',
								value: '',
							},
						];
					}

					return allocations.map((allocation: any) => ({
						name: `${allocation.attributes.ip}:${allocation.attributes.port} [${allocation.attributes.is_default ? 'PRIMARY' : 'SECONDARY'}] (ID: ${allocation.attributes.id})`,
						value: allocation.attributes.id,
					}));
				} catch (error) {
					console.error('Error fetching allocations:', error);
					return [
						{
							name: `Error: ${(error as Error).message}`,
							value: '',
						},
					];
				}
			},

			async getSubusersForServer(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const serverId = this.getCurrentNodeParameter('serverId') as string;

					if (!serverId) {
						return [];
					}

					const { pterodactylApiRequest } = await import('../../shared/transport');
					const response = await pterodactylApiRequest.call(
						this as unknown as IExecuteFunctions,
						'GET',
						'/api/client',
						`/servers/${serverId}/users`,
						{},
						{},
						{},
						0,
					);

					const subusers = response.data || [];

					if (subusers.length === 0) {
						return [
							{
								name: 'No subusers found for this server',
								value: '',
							},
						];
					}

					return subusers.map((subuser: any) => ({
						name: `${subuser.attributes.email} (UUID: ${subuser.attributes.uuid})`,
						value: subuser.attributes.uuid,
					}));
				} catch (error) {
					console.error('Error fetching subusers:', error);
					return [
						{
							name: `Error: ${(error as Error).message}`,
							value: '',
						},
					];
				}
			},

			async getApiKeys(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const { pterodactylApiRequest } = await import('../../shared/transport');
					const response = await pterodactylApiRequest.call(
						this as unknown as IExecuteFunctions,
						'GET',
						'/api/client',
						'/account/api-keys',
						{},
						{},
						{},
						0,
					);

					const apiKeys = response.data || [];

					if (apiKeys.length === 0) {
						return [
							{
								name: 'No API keys found',
								value: '',
							},
						];
					}

					return apiKeys.map((apiKey: any) => ({
						name: `${apiKey.attributes.description} - Last used: ${apiKey.attributes.last_used_at || 'Never'} (Identifier: ${apiKey.attributes.identifier})`,
						value: apiKey.attributes.identifier,
					}));
				} catch (error) {
					console.error('Error fetching API keys:', error);
					return [
						{
							name: `Error: ${(error as Error).message}`,
							value: '',
						},
					];
				}
			},

			async getAvailablePermissions(
				this: ILoadOptionsFunctions,
			): Promise<INodePropertyOptions[]> {
				try {
					const { pterodactylApiRequest } = await import('../../shared/transport');
					const response = await pterodactylApiRequest.call(
						this as unknown as IExecuteFunctions,
						'GET',
						'/api/client',
						'/permissions',
						{},
						{},
						{},
						0,
					);

					const permissions = response.attributes?.permissions || response.permissions || {};
					const options: INodePropertyOptions[] = [];

					// Flatten permissions object into array of options
					// API returns: { category: { description: '...', keys: { permission: 'desc', ... } } }
					for (const [category, categoryData] of Object.entries(permissions)) {
						if (typeof categoryData === 'object' && categoryData !== null && 'keys' in categoryData) {
							const keys = (categoryData as any).keys || {};
							for (const permission of Object.keys(keys)) {
								options.push({
									name: `${category}.${permission}`,
									value: `${category}.${permission}`,
								});
							}
						}
					}

					if (options.length === 0) {
						return [
							{
								name: 'No permissions available',
								value: '',
							},
						];
					}

					return options.sort((a, b) => a.name.localeCompare(b.name));
				} catch (error) {
					console.error('Error fetching available permissions:', error);
					return [
						{
							name: `Error: ${(error as Error).message}`,
							value: '',
						},
					];
				}
			},
		},
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
					if (operation === 'get') {
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
					} else if (operation === 'listTasks') {
						responseData = await listScheduleTasks.call(this, i);
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
					if (operation === 'list') {
						responseData = await listAllocations.call(this, i);
					} else if (operation === 'assign') {
						responseData = await assignAllocation.call(this, i);
					} else if (operation === 'setPrimary') {
						responseData = await setPrimary.call(this, i);
					} else if (operation === 'delete') {
						responseData = await deleteAllocation.call(this, i);
					} else if (operation === 'updateNotes') {
						responseData = await updateNotes.call(this, i);
					}
				} else if (resource === 'subuser') {
					if (operation === 'list') {
						responseData = await listSubusers.call(this, i);
					} else if (operation === 'createSubuser') {
						responseData = await createSubuser.call(this, i);
					} else if (operation === 'get') {
						responseData = await getSubuser.call(this, i);
					} else if (operation === 'updateSubuser') {
						responseData = await updateSubuser.call(this, i);
					} else if (operation === 'delete') {
						responseData = await deleteSubuser.call(this, i);
					} else if (operation === 'getPermissions') {
						responseData = await getPermissions.call(this, i);
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
