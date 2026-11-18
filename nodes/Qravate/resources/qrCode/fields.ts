import type { INodeProperties } from 'n8n-workflow';

const show = (operation: string[]) => ({ show: { resource: ['qrCode'], operation } });

export const qrCodeFields: INodeProperties[] = [
	{
		displayName: 'QR Code ID',
		name: 'qrCodeId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: show(['delete', 'get', 'getStats', 'pause', 'resume', 'update']),
		description: 'The ID of the QR code, as returned by Create or Get Many',
	},

	// Create
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'Shop window poster',
		displayOptions: show(['create']),
		description: 'Name shown in your QRavate account. Scanners never see it.',
		routing: { send: { type: 'body', property: 'name' } },
	},
	{
		displayName: 'Destination',
		name: 'destination',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'https://example.com',
		displayOptions: show(['create']),
		description: 'URL scanners are sent to. You can change it later without reprinting.',
		routing: { send: { type: 'body', property: 'destination' } },
	},

	// Update
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: show(['update']),
		options: [
			{
				displayName: 'Destination',
				name: 'destination',
				type: 'string',
				default: '',
				placeholder: 'https://example.com',
				description: 'New URL scanners are sent to',
				routing: { send: { type: 'body', property: 'destination' } },
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				routing: { send: { type: 'body', property: 'name' } },
			},
		],
	},

	// Get Many
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: show(['getAll']),
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 200 },
		default: 50,
		displayOptions: { show: { resource: ['qrCode'], operation: ['getAll'], returnAll: [false] } },
		description: 'Max number of results to return',
		routing: { send: { type: 'query', property: 'limit' } },
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: show(['getAll']),
		options: [
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Text found in the name or the destination',
				routing: { send: { type: 'query', property: 'search' } },
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'options',
				default: 'active',
				options: [
					{ name: 'Active', value: 'active' },
					{ name: 'Paused', value: 'paused' },
				],
				routing: { send: { type: 'query', property: 'state' } },
			},
		],
	},

	// Get Stats
	{
		displayName: 'Period',
		name: 'period',
		type: 'collection',
		placeholder: 'Add Date',
		default: {},
		displayOptions: show(['getStats']),
		description: 'Defaults to the last 30 days',
		options: [
			{
				displayName: 'From',
				name: 'from',
				type: 'string',
				default: '',
				placeholder: '2026-01-01',
				description: 'First day included (YYYY-MM-DD, Paris time)',
				routing: { send: { type: 'query', property: 'from' } },
			},
			{
				displayName: 'To',
				name: 'to',
				type: 'string',
				default: '',
				placeholder: '2026-01-31',
				description: 'Last day included (YYYY-MM-DD, Paris time)',
				routing: { send: { type: 'query', property: 'to' } },
			},
		],
	},
];
