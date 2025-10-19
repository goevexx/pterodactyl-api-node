import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const deleteTaskOperation: INodeProperties[] = [
	{
		displayName: 'Server ID',
		name: 'serverId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['deleteTask'],
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
				operation: ['deleteTask'],
			},
		},
		default: '',
		description: 'ID of the schedule',
	},
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['deleteTask'],
			},
		},
		default: '',
		description: 'ID of the task to delete',
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
