import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const listServersOperation: INodeProperties[] = [];

export async function listServers(this: IExecuteFunctions, index: number): Promise<any> {
	const response = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/application',
		`/servers`,
		{},
		{},
		{},
		index,
	);
	// Extract attributes from each object
	return (response.data || []).map((item: any) => item.attributes || item);
}
