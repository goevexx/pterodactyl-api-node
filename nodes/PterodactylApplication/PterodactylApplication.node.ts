import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import {
	listUsers,
	listUsersOperation,
	getUser,
	getUserOperation,
	getUserByExternalId,
	getUserByExternalIdOperation,
	createUser,
	createUserOperation,
	updateUser,
	updateUserOperation,
	deleteUser,
	deleteUserOperation,
} from './actions/user';
import {
	listServers,
	listServersOperation,
	getServer,
	getServerOperation,
	getServerByExternalId,
	getServerByExternalIdOperation,
	createServer,
	createServerOperation,
	updateServerDetails,
	updateServerDetailsOperation,
	updateServerBuild,
	updateServerBuildOperation,
	updateServerStartup,
	updateServerStartupOperation,
	suspendServer,
	suspendServerOperation,
	unsuspendServer,
	unsuspendServerOperation,
	reinstallServer,
	reinstallServerOperation,
	deleteServer,
	deleteServerOperation,
	forceDeleteServer,
	forceDeleteServerOperation,
} from './actions/server';
import {
	listNodes,
	listNodesOperation,
	getNode,
	getNodeOperation,
	createNode,
	createNodeOperation,
	updateNode,
	updateNodeOperation,
	deleteNode,
	deleteNodeOperation,
	getNodeConfiguration,
	getNodeConfigurationOperation,
	listNodeAllocations,
	listNodeAllocationsOperation,
	createNodeAllocations,
	createNodeAllocationsOperation,
	deleteNodeAllocation,
	deleteNodeAllocationOperation,
} from './actions/node';
import {
	listLocations,
	listLocationsOperation,
	getLocation,
	getLocationOperation,
	createLocation,
	createLocationOperation,
	updateLocation,
	updateLocationOperation,
	deleteLocation,
	deleteLocationOperation,
} from './actions/location';
import {
	listNests,
	listNestsOperation,
	getNest,
	getNestOperation,
	listNestEggs,
	listNestEggsOperation,
	getNestEgg,
	getNestEggOperation,
} from './actions/nest';

export class PterodactylApplication implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Pterodactyl Application',
		name: 'pterodactylApplication',
		icon: 'file:pterodactylApplication.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Administrative panel management with Pterodactyl Panel Application API',
		defaults: {
			name: 'Pterodactyl Application',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'pterodactylApplicationApi',
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
						name: 'Location',
						value: 'location',
						description: 'Manage server locations',
					},
					{
						name: 'Nest',
						value: 'nest',
						description: 'Browse server templates (nests and eggs)',
					},
					{
						name: 'Node',
						value: 'node',
						description: 'Manage infrastructure nodes',
					},
					{
						name: 'Server',
						value: 'server',
						description: 'Administrative server management',
					},
					{
						name: 'User',
						value: 'user',
						description: 'Manage panel users',
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
						resource: ['user'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'Get all users',
						action: 'List users',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get user details',
						action: 'Get a user',
					},
					{
						name: 'Get By External ID',
						value: 'getByExternalId',
						description: 'Get user by external ID',
						action: 'Get user by external ID',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new user',
						action: 'Create user',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a user',
						action: 'Update user',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a user',
						action: 'Delete user',
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
						resource: ['server'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'Get all servers',
						action: 'List servers',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get server details',
						action: 'Get a server',
					},
					{
						name: 'Get By External ID',
						value: 'getByExternalId',
						description: 'Get server by external ID',
						action: 'Get server by external ID',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new server',
						action: 'Create server',
					},
					{
						name: 'Update Details',
						value: 'updateDetails',
						description: 'Update server details',
						action: 'Update details',
					},
					{
						name: 'Update Build',
						value: 'updateBuild',
						description: 'Update server build configuration',
						action: 'Update build',
					},
					{
						name: 'Update Startup',
						value: 'updateStartup',
						description: 'Update server startup settings',
						action: 'Update startup',
					},
					{
						name: 'Suspend',
						value: 'suspend',
						description: 'Suspend a server',
						action: 'Suspend server',
					},
					{
						name: 'Unsuspend',
						value: 'unsuspend',
						description: 'Unsuspend a server',
						action: 'Unsuspend server',
					},
					{
						name: 'Reinstall',
						value: 'reinstall',
						description: 'Reinstall a server',
						action: 'Reinstall server',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a server',
						action: 'Delete server',
					},
					{
						name: 'Force Delete',
						value: 'forceDelete',
						description: 'Force delete a server',
						action: 'Force delete server',
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
						resource: ['node'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'Get all nodes',
						action: 'List nodes',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get node details',
						action: 'Get a node',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new node',
						action: 'Create node',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a node',
						action: 'Update node',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a node',
						action: 'Delete node',
					},
					{
						name: 'Get Configuration',
						value: 'getConfiguration',
						description: 'Get node configuration',
						action: 'Get configuration',
					},
					{
						name: 'List Allocations',
						value: 'listAllocations',
						description: 'List node allocations',
						action: 'List allocations',
					},
					{
						name: 'Create Allocations',
						value: 'createAllocations',
						description: 'Create node allocations',
						action: 'Create allocations',
					},
					{
						name: 'Delete Allocation',
						value: 'deleteAllocation',
						description: 'Delete a node allocation',
						action: 'Delete allocation',
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
						resource: ['location'],
					},
				},
				options: [
					{
						name: 'List',
						value: 'list',
						description: 'Get all locations',
						action: 'List locations',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get location details',
						action: 'Get a location',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new location',
						action: 'Create location',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a location',
						action: 'Update location',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a location',
						action: 'Delete location',
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
						resource: ['nest'],
					},
				},
				options: [
					{
						name: 'List Nests',
						value: 'listNests',
						description: 'Get all nests',
						action: 'List nests',
					},
					{
						name: 'Get Nest',
						value: 'getNest',
						description: 'Get nest details',
						action: 'Get nest',
					},
					{
						name: 'List Eggs',
						value: 'listEggs',
						description: 'List eggs in a nest',
						action: 'List eggs',
					},
					{
						name: 'Get Egg',
						value: 'getEgg',
						description: 'Get egg details',
						action: 'Get egg',
					},
				],
				default: 'listNests',
				description: 'The operation to perform',
			},
			...listUsersOperation,
			...getUserOperation,
			...getUserByExternalIdOperation,
			...createUserOperation,
			...updateUserOperation,
			...deleteUserOperation,
			...listServersOperation,
			...getServerOperation,
			...getServerByExternalIdOperation,
			...createServerOperation,
			...updateServerDetailsOperation,
			...updateServerBuildOperation,
			...updateServerStartupOperation,
			...suspendServerOperation,
			...unsuspendServerOperation,
			...reinstallServerOperation,
			...deleteServerOperation,
			...forceDeleteServerOperation,
			...listNodesOperation,
			...getNodeOperation,
			...createNodeOperation,
			...updateNodeOperation,
			...deleteNodeOperation,
			...getNodeConfigurationOperation,
			...listNodeAllocationsOperation,
			...createNodeAllocationsOperation,
			...deleteNodeAllocationOperation,
			...listLocationsOperation,
			...getLocationOperation,
			...createLocationOperation,
			...updateLocationOperation,
			...deleteLocationOperation,
			...listNestsOperation,
			...getNestOperation,
			...listNestEggsOperation,
			...getNestEggOperation,
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

				if (resource === 'user') {
					if (operation === 'list') {
						responseData = await listUsers.call(this, i);
					} else if (operation === 'get') {
						responseData = await getUser.call(this, i);
					} else if (operation === 'getByExternalId') {
						responseData = await getUserByExternalId.call(this, i);
					} else if (operation === 'create') {
						responseData = await createUser.call(this, i);
					} else if (operation === 'update') {
						responseData = await updateUser.call(this, i);
					} else if (operation === 'delete') {
						responseData = await deleteUser.call(this, i);
					}
				} else if (resource === 'server') {
					if (operation === 'list') {
						responseData = await listServers.call(this, i);
					} else if (operation === 'get') {
						responseData = await getServer.call(this, i);
					} else if (operation === 'getByExternalId') {
						responseData = await getServerByExternalId.call(this, i);
					} else if (operation === 'create') {
						responseData = await createServer.call(this, i);
					} else if (operation === 'updateDetails') {
						responseData = await updateServerDetails.call(this, i);
					} else if (operation === 'updateBuild') {
						responseData = await updateServerBuild.call(this, i);
					} else if (operation === 'updateStartup') {
						responseData = await updateServerStartup.call(this, i);
					} else if (operation === 'suspend') {
						responseData = await suspendServer.call(this, i);
					} else if (operation === 'unsuspend') {
						responseData = await unsuspendServer.call(this, i);
					} else if (operation === 'reinstall') {
						responseData = await reinstallServer.call(this, i);
					} else if (operation === 'delete') {
						responseData = await deleteServer.call(this, i);
					} else if (operation === 'forceDelete') {
						responseData = await forceDeleteServer.call(this, i);
					}
				} else if (resource === 'node') {
					if (operation === 'list') {
						responseData = await listNodes.call(this, i);
					} else if (operation === 'get') {
						responseData = await getNode.call(this, i);
					} else if (operation === 'create') {
						responseData = await createNode.call(this, i);
					} else if (operation === 'update') {
						responseData = await updateNode.call(this, i);
					} else if (operation === 'delete') {
						responseData = await deleteNode.call(this, i);
					} else if (operation === 'getConfiguration') {
						responseData = await getNodeConfiguration.call(this, i);
					} else if (operation === 'listAllocations') {
						responseData = await listNodeAllocations.call(this, i);
					} else if (operation === 'createAllocations') {
						responseData = await createNodeAllocations.call(this, i);
					} else if (operation === 'deleteAllocation') {
						responseData = await deleteNodeAllocation.call(this, i);
					}
				} else if (resource === 'location') {
					if (operation === 'list') {
						responseData = await listLocations.call(this, i);
					} else if (operation === 'get') {
						responseData = await getLocation.call(this, i);
					} else if (operation === 'create') {
						responseData = await createLocation.call(this, i);
					} else if (operation === 'update') {
						responseData = await updateLocation.call(this, i);
					} else if (operation === 'delete') {
						responseData = await deleteLocation.call(this, i);
					}
				} else if (resource === 'nest') {
					if (operation === 'listNests') {
						responseData = await listNests.call(this, i);
					} else if (operation === 'getNest') {
						responseData = await getNest.call(this, i);
					} else if (operation === 'listEggs') {
						responseData = await listNestEggs.call(this, i);
					} else if (operation === 'getEgg') {
						responseData = await getNestEgg.call(this, i);
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
