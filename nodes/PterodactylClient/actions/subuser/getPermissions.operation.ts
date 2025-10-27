import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { pterodactylApiRequest } from '../../../../shared/transport';

export const getPermissionsOperation: INodeProperties[] = [];

export async function getPermissions(this: IExecuteFunctions, index: number): Promise<any> {
	const response = await pterodactylApiRequest.call(
		this,
		'GET',
		'/api/client',
		'/permissions',
		{},
		{},
		{},
		index,
	);
	return response;
}
