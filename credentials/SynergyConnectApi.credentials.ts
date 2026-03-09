import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SynergyConnectApi implements ICredentialType {
	name = 'synergyConnectApi';
	displayName = 'Synergy Connect API';
	icon = { light: 'file:../nodes/SynergyConnect/synergyConnect.svg', dark: 'file:../nodes/SynergyConnect/synergyConnect.svg' } as const;
	documentationUrl = 'https://synergyconnect.com.br/docs';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			placeholder: 'sk_your_api_key',
			description: 'API Key from the Synergy Connect dashboard',
		},
		{
			displayName: 'Phone Number ID',
			name: 'phoneNumberId',
			type: 'string',
			default: '',
			required: true,
			description: 'Phone Number ID of your WhatsApp instance (found in the dashboard)',
		},
		{
			displayName: 'WABA ID',
			name: 'wabaId',
			type: 'string',
			default: '',
			description: 'WhatsApp Business Account ID (required for template operations)',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-api-key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://synergyconnect.com.br/api/v1',
			url: '=/{{$credentials.phoneNumberId}}/messages',
			method: 'POST',
			body: {
				messaging_product: 'whatsapp',
				to: '5544988581702',
				type: 'text',
				text: { body: 'test' },
			},
		},
	};
}
