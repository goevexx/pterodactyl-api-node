import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const updateTaskOperation: INodeProperties[] = [
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
				operation: ['updateTask'],
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
				operation: ['updateTask'],
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
				operation: ['updateTask'],
			},
		},
		default: '',
		description: 'Select the task to update',
	},
	{
		displayName: 'Action',
		name: 'action',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['updateTask'],
			},
		},
		options: [
			{
				name: 'Command',
				value: 'command',
				description: 'Send a console command',
			},
			{
				name: 'Power',
				value: 'power',
				description: 'Send a power action',
			},
			{
				name: 'Backup',
				value: 'backup',
				description: 'Create a backup',
			},
		],
		default: 'command',
		description: 'Type of action to perform',
	},
	{
		displayName: 'Payload',
		name: 'payload',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['updateTask'],
			},
		},
		default: '',
		placeholder: 'say Hello World',
		description: 'The command, power action (start/stop/restart/kill), or backup name',
	},
	{
		displayName: 'Time Offset',
		name: 'timeOffset',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['updateTask'],
			},
		},
		default: 0,
		description: 'Seconds to wait before executing this task',
	},
];

export async function updateTask(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as string;
	const scheduleId = this.getNodeParameter('scheduleId', index) as string;
	const taskId = this.getNodeParameter('taskId', index) as string;
	const action = this.getNodeParameter('action', index) as string;
	const payload = this.getNodeParameter('payload', index) as string;
	const timeOffset = this.getNodeParameter('timeOffset', index) as number;

	const body = {
		action,
		payload,
		time_offset: timeOffset,
	};

	const response = await pterodactylApiRequest.call(
		this,
		'POST',
		'/api/client',
		`/servers/${serverId}/schedules/${scheduleId}/tasks/${taskId}`,
		body,
		{},
		{},
		index,
	);
	return response;
}
