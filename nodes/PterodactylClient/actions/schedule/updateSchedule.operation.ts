import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const updateScheduleOperation: INodeProperties[] = [
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
				operation: ['update'],
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
				operation: ['update'],
			},
		},
		default: '',
		description: 'Select the schedule to update',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Name of the schedule',
	},
	{
		displayName: 'Cron Expression',
		name: 'cron',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['update'],
			},
		},
		default: '',
		placeholder: '*/5 * * * *',
		description: 'Cron expression for schedule timing (minute hour day month weekday)',
	},
	{
		displayName: 'Is Active',
		name: 'isActive',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['update'],
			},
		},
		default: true,
		description: 'Whether the schedule is active',
	},
	{
		displayName: 'Only When Online',
		name: 'onlyWhenOnline',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['update'],
			},
		},
		default: false,
		description: 'Whether to only run the schedule when the server is online',
	},
];

export async function updateSchedule(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as string;
	const scheduleId = this.getNodeParameter('scheduleId', index) as string;
	const name = this.getNodeParameter('name', index) as string;
	const cron = this.getNodeParameter('cron', index) as string;
	const isActive = this.getNodeParameter('isActive', index) as boolean;
	const onlyWhenOnline = this.getNodeParameter('onlyWhenOnline', index) as boolean;

	// Fetch existing schedule to get current values
	const existingSchedule = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/client',
		`/servers/${serverId}/schedules/${scheduleId}`,
		{},
		{},
		{},
		index,
	);

	const body: any = {
		name: name || existingSchedule.attributes.name,
		is_active: isActive,
		only_when_online: onlyWhenOnline,
	};

	// If cron is provided, parse it; otherwise use existing values
	if (cron) {
		const cronParts = cron.split(' ');
		if (cronParts.length !== 5) {
			throw new Error('Invalid cron expression. Expected format: minute hour day month weekday');
		}
		body.minute = cronParts[0];
		body.hour = cronParts[1];
		body.day_of_month = cronParts[2];
		body.month = cronParts[3];
		body.day_of_week = cronParts[4];
	} else {
		// Use existing cron values (required by API)
		body.minute = existingSchedule.attributes.cron.minute;
		body.hour = existingSchedule.attributes.cron.hour;
		body.day_of_month = existingSchedule.attributes.cron.day_of_month;
		body.month = existingSchedule.attributes.cron.month;
		body.day_of_week = existingSchedule.attributes.cron.day_of_week;
	}

	const response = await pterodactylApiRequest.call(
		this,
		'POST',
		'/api/client',
		`/servers/${serverId}/schedules/${scheduleId}`,
		body,
		{},
		{},
		index,
	);
	return response;
}
