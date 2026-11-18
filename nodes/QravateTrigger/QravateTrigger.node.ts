import { createHmac, timingSafeEqual } from 'crypto';
import {
	NodeConnectionTypes,
	type IDataObject,
	type IHookFunctions,
	type IHttpRequestMethods,
	type INodeType,
	type INodeTypeDescription,
	type IWebhookFunctions,
	type IWebhookResponseData,
} from 'n8n-workflow';

/** Signature sent by QRavate: header `X-Webhook-Signature: t=<unix>,v1=<hex HMAC-SHA256 of "t.body">`. */
export function isValidSignature(secret: string, header: string, rawBody: string, now = Date.now()): boolean {
	const parts = Object.fromEntries(header.split(',').map((p) => p.split('=') as [string, string]));
	const timestamp = Number(parts.t);
	if (!timestamp || !parts.v1 || Math.abs(now / 1000 - timestamp) > 300) return false;
	const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
	const received = Buffer.from(parts.v1, 'hex');
	return received.length === expected.length / 2 && timingSafeEqual(received, Buffer.from(expected, 'hex'));
}

async function api(
	this: IHookFunctions,
	method: IHttpRequestMethods,
	path: string,
	body?: IDataObject,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('qravateApi');
	return (await this.helpers.httpRequestWithAuthentication.call(this, 'qravateApi', {
		method,
		url: `${credentials.baseUrl as string}${path}`,
		body,
		json: true,
	})) as IDataObject;
}

export class QravateTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'QRavate Trigger',
		name: 'qravateTrigger',
		icon: { light: 'file:../../icons/qravate.svg', dark: 'file:../../icons/qravate.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"].join(", ")}}',
		description: 'Starts the workflow when a QRavate QR code is created, changed or reaches a number of scans',
		defaults: {
			name: 'QRavate Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'qravateApi', required: true }],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				default: ['qr.created'],
				options: [
					{
						name: 'QR Code Created',
						value: 'qr.created',
						description: 'A QR code was created in the workspace',
					},
					{
						name: 'Destination Changed',
						value: 'qr.destination_changed',
						description: 'The destination of a QR code was changed',
					},
					{
						name: 'State Changed',
						value: 'qr.state_changed',
						description: 'A QR code was paused or resumed',
					},
					{
						name: 'Scan Threshold Reached',
						value: 'scans.threshold',
						description: 'A QR code reached the number of scans set below',
					},
				],
			},
			{
				displayName: 'Number of Scans',
				name: 'scanThreshold',
				type: 'number',
				required: true,
				typeOptions: { minValue: 1 },
				default: 100,
				displayOptions: { show: { events: ['scans.threshold'] } },
				description: 'Triggers once per QR code when its total scans reach this number',
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const data = this.getWorkflowStaticData('node');
				if (!data.webhookId) return false;
				const { data: hooks } = (await api.call(this, 'GET', '/webhooks')) as { data: IDataObject[] };
				if (hooks.some((h) => h.id === data.webhookId && !h.disabled_at)) return true;
				delete data.webhookId;
				delete data.webhookSecret;
				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const events = this.getNodeParameter('events') as string[];
				const body: IDataObject = {
					url: this.getNodeWebhookUrl('default'),
					events,
					source: 'n8n',
				};
				if (events.includes('scans.threshold')) body.scan_threshold = this.getNodeParameter('scanThreshold');
				const { data: hook } = (await api.call(this, 'POST', '/webhooks', body)) as { data: IDataObject };
				const data = this.getWorkflowStaticData('node');
				data.webhookId = hook.id;
				data.webhookSecret = hook.secret;
				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const data = this.getWorkflowStaticData('node');
				if (data.webhookId) {
					try {
						await api.call(this, 'DELETE', `/webhooks/${encodeURIComponent(data.webhookId as string)}`);
					} catch (error) {
						this.logger.warn(`QRavate: could not delete webhook ${String(data.webhookId)}`, { error });
						return false;
					}
				}
				delete data.webhookId;
				delete data.webhookSecret;
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const secret = this.getWorkflowStaticData('node').webhookSecret as string | undefined;
		const request = this.getRequestObject();
		if (secret) {
			const header = String(request.headers['x-webhook-signature'] ?? '');
			const rawBody = (request as unknown as { rawBody?: Buffer }).rawBody?.toString('utf8') ?? JSON.stringify(request.body);
			if (!isValidSignature(secret, header, rawBody)) {
				this.getResponseObject().status(401).send('Invalid signature');
				return { noWebhookResponse: true };
			}
		}
		return { workflowData: [this.helpers.returnJsonArray(this.getBodyData())] };
	}
}
