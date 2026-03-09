import type {
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IDataObject,
	IHttpRequestOptions,
} from 'n8n-workflow';

const BASE_URL = 'https://synergyconnect.com.br/api/v1';

export async function synergyConnectApiRequest(
	this: IExecuteFunctions | IHookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject> {
	const options: IHttpRequestOptions = {
		method,
		url: `${BASE_URL}${endpoint}`,
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
