import type {
	ICredentialDataDecryptedObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IDataObject,
	IHttpRequestOptions,
} from 'n8n-workflow';

const DEFAULT_BASE_URL = 'https://legacy.synergyconnect.com.br/api/v1';

export function getBaseUrl(credentials: ICredentialDataDecryptedObject): string {
	const baseUrl = typeof credentials.baseUrl === 'string' ? credentials.baseUrl.trim() : '';
	return (baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');
}

export async function synergyConnectApiRequest(
	this: IExecuteFunctions | IHookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject> {
	const credentials = await this.getCredentials('synergyConnectApi');
	const options: IHttpRequestOptions = {
		method,
		url: `${getBaseUrl(credentials)}${endpoint}`,
		qs,
		json: true,
	};

	if (Object.keys(body).length > 0) {
		options.body = body;
	}

	return await this.helpers.httpRequestWithAuthentication.call(
		this,
		'synergyConnectApi',
		options,
	) as IDataObject;
}
