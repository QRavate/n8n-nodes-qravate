import type { INodeProperties } from 'n8n-workflow';
import { qrCodeFields } from './fields';

const unwrap = { postReceive: [{ type: 'rootProperty' as const, properties: { property: 'data' } }] };
const byId = '=/qr/{{ toPathSegment($parameter.qrCodeId) }}';

export const qrCodeDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['qrCode'] } },
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a QR code',
				description: 'Create a dynamic QR code',
				routing: { request: { method: 'POST', url: '/qr' }, output: unwrap },
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a QR code',
				description: 'Delete a QR code (restorable for 30 days from your QRavate account)',
				routing: { request: { method: 'DELETE', url: byId }, output: unwrap },
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a QR code',
				description: 'Get a QR code by ID',
				routing: { request: { method: 'GET', url: byId }, output: unwrap },
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many QR codes',
				description: 'List QR codes, newest first',
				routing: {
					request: { method: 'GET', url: '/qr' },
					send: { paginate: '={{ $parameter.returnAll }}' },
					operations: {
						pagination: {
							type: 'generic',
							properties: {
								continue: '={{ !!$response.body.next_cursor }}',
								request: {
									qs: { cursor: '={{ $response.body.next_cursor }}', limit: 200 },
								},
							},
						},
					},
					output: unwrap,
				},
			},
			{
				name: 'Get Stats',
				value: 'getStats',
				action: 'Get the scan stats of a QR code',
				description: 'Get scans over a period: total, by day, country and device',
				routing: {
					request: { method: 'GET', url: '=/qr/{{ toPathSegment($parameter.qrCodeId) }}/stats' },
					output: unwrap,
				},
			},
			{
				name: 'Pause',
				value: 'pause',
				action: 'Pause a QR code',
				description: 'Scans show a neutral page until the QR code is resumed',
				routing: { request: { method: 'PATCH', url: byId, body: { state: 'paused' } }, output: unwrap },
			},
			{
				name: 'Resume',
				value: 'resume',
				action: 'Resume a QR code',
				description: 'Send scans to the destination again',
				routing: { request: { method: 'PATCH', url: byId, body: { state: 'active' } }, output: unwrap },
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a QR code',
				description: 'Change the destination or the name. The printed QR code stays the same.',
				routing: { request: { method: 'PATCH', url: byId }, output: unwrap },
			},
		],
		default: 'create',
	},
	...qrCodeFields,
];
