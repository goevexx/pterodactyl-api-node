import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const createScheduleOperation: INodeProperties[] = [
	{
		displayName: 'Server ID',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'ID of the server',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Name of the schedule',
	},
	{
		displayName: 'Cron Expression',
		name: 'cron',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['create'],
			},
		},
		default: '*/5 * * * *',
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
				operation: ['create'],
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
				operation: ['create'],
			},
		},
		default: false,
		description: 'Whether to only run the schedule when the server is online',
	},
];

export async function createSchedule(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as string;
	const name = this.getNodeParameter('name', index) as string;
	const cron = this.getNodeParameter('cron', index) as string;
	const isActive = this.getNodeParameter('isActive', index) as boolean;
	const onlyWhenOnline = this.getNodeParameter('onlyWhenOnline', index) as boolean;

	// Parse cron expression into components
	const cronParts = cron.split(' ');
	if (cronParts.length !== 5) {
		throw new Error('Invalid cron expression. Expected format: minute hour day month weekday');
	}

	const body = {
		name,
		is_active: isActive,
		only_when_online: onlyWhenOnline,
		minute: cronParts[0],
		hour: cronParts[1],
		day_of_month: cronParts[2],
		month: cronParts[3],
		day_of_week: cronParts[4],
	};

	const response = await pterodactylApiRequest.call(
		this,
		'POST',
		'/api/client',
		`/servers/${serverId}/schedules`,
		body,
		{},
		{},
		index,
	);
	return response;
}
