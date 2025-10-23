import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const executeScheduleOperation: INodeProperties[] = [
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
				operation: ['execute'],
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
				operation: ['execute'],
			},
		},
		default: '',
		description: 'Select the schedule to execute',
	},
];

export async function executeSchedule(this: IExecuteFunctions, index: number): Promise<any> {
	const serverId = this.getNodeParameter('serverId', index) as string;
	const scheduleId = this.getNodeParameter('scheduleId', index) as string;

	await pterodactylApiRequest.call(
		this,
		'POST',
		'/api/client',
		`/servers/${serverId}/schedules/${scheduleId}/execute`,
		{},
		{},
		{},
		index,
	);
	return { success: true, message: 'Schedule executed' };
}
