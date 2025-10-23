import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const deleteTaskOperation: INodeProperties[] = [
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
				operation: ['deleteTask'],
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
				operation: ['deleteTask'],
			},
		},
		default: '',
		description: 'Select the schedule containing the task',
	},
	{
		displayName: 'Task',
		name: 'taskId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getTasksForSchedule',
			loadOptionsDependsOn: ['serverId', 'scheduleId'],
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['deleteTask'],
			},
		},
		default: '',
		description: 'Select the task to delete',
	},
];

export async function deleteTask(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as string;
	const scheduleId = this.getNodeParameter('scheduleId', index) as string;
	const taskId = this.getNodeParameter('taskId', index) as string;

	await pterodactylApiRequest.call(
		this,
		'DELETE',
		'/api/client',
		`/servers/${serverId}/schedules/${scheduleId}/tasks/${taskId}`,
		{},
		{},
		{},
		index,
	);
	return { success: true };
}
