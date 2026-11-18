import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class QravateApi implements ICredentialType {
	name = 'qravateApi';

	displayName = 'QRavate API';

	icon: Icon = { light: 'file:../icons/qravate.svg', dark: 'file:../icons/qravate.dark.svg' };

	documentationUrl = 'https://github.com/QRavate/n8n-nodes-qravate?tab=readme-ov-file#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description:
				'Starts with sk_. Create it in your QRavate account, under API et webhooks (Pro and Max plans).',
		},
		{
			displayName: 'API URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://www.qravate.com/api/v1',
			description: 'Leave the default value unless QRavate support tells you otherwise',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/me',
		},
	};
}
