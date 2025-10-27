import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const listScheduleTasksOperation: INodeProperties[] = [
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
				resource: ['schedule'],
				operation: ['listTasks'],
			},
		},
		default: '',
		description: 'Select the server containing the schedule',
	},
	{
		displayName: 'Schedule',
		name: 'scheduleId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getSchedulesForServer',
			loadOptionsDependsOn: ['serverId'],
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['listTasks'],
			},
		},
		default: '',
		description: 'Select the schedule to list tasks from',
	},
];

export async function listScheduleTasks(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as string;
	const scheduleId = this.getNodeParameter('scheduleId', index) as string;

	const response = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/client',
		`/servers/${serverId}/schedules/${scheduleId}`,
		{},
		{ include: 'tasks' },
		{},
		index,
	);

	// Extract tasks from the included relationships
	const scheduleData = response.attributes || response;
	const tasks = scheduleData.relationships?.tasks?.data || [];
	return tasks;
}
