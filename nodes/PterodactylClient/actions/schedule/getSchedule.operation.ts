import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const getScheduleOperation: INodeProperties[] = [
	{
		displayName: 'Server ID',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['get'],
			},
		},
		default: '',
		description: 'ID of the server',
	},
	{
		displayName: 'Schedule ID',
		name: 'scheduleId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['get'],
			},
		},
		default: '',
		description: 'ID of the schedule',
	},
];

export async function getSchedule(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as string;
	const scheduleId = this.getNodeParameter('scheduleId', index) as string;

	const response = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/client',
		`/servers/${serverId}/schedules/${scheduleId}`,
		{},
		{},
		{},
		index,
	);
	return response;
}
