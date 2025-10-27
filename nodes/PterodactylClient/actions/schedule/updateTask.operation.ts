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
		displayName: 'Power Action',
		name: 'powerAction',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['updateTask'],
				action: ['power'],
			},
		},
		options: [
			{
				name: 'Start',
				value: 'start',
				description: 'Start the server',
			},
			{
				name: 'Stop',
				value: 'stop',
				description: 'Stop the server',
			},
			{
				name: 'Restart',
				value: 'restart',
				description: 'Restart the server',
			},
			{
				name: 'Kill',
				value: 'kill',
				description: 'Forcefully kill the server',
			},
		],
		default: 'start',
		description: 'Power action to perform',
	},
	{
		displayName: 'Command',
		name: 'command',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['updateTask'],
				action: ['command'],
			},
		},
		default: '',
		placeholder: 'say Hello World',
		description: 'The console command to execute',
	},
	{
		displayName: 'Backup Name',
		name: 'backupName',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['updateTask'],
				action: ['backup'],
			},
		},
		default: '',
		placeholder: 'my-backup',
		description: 'Optional custom backup filename. Leave empty for auto-generated name.',
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
	const timeOffset = this.getNodeParameter('timeOffset', index) as number;

	// Get the appropriate payload based on action type
	let payload = '';
	if (action === 'power') {
		payload = this.getNodeParameter('powerAction', index) as string;
	} else if (action === 'command') {
		payload = this.getNodeParameter('command', index) as string;
	} else if (action === 'backup') {
		payload = this.getNodeParameter('backupName', index, '') as string;
	}

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
