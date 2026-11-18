import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { qrCodeDescription } from './resources/qrCode';

export class Qravate implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'QRavate',
		name: 'qravate',
		icon: { light: 'file:../../icons/qravate.svg', dark: 'file:../../icons/qravate.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Create and manage QRavate dynamic QR codes',
		defaults: {
			name: 'QRavate',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'qravateApi', required: true }],
		requestDefaults: {
			baseURL: '={{$credentials.baseUrl}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [{ name: 'QR Code', value: 'qrCode' }],
				default: 'qrCode',
			},
			...qrCodeDescription,
		],
	};
}
