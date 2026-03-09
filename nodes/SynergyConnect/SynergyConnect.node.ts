import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { synergyConnectApiRequest } from './GenericFunctions';
import { messageOperations, messageFields } from './descriptions/MessageDescription';
import { mediaOperations, mediaFields } from './descriptions/MediaDescription';
import { templateOperations, templateFields } from './descriptions/TemplateDescription';

async function handleMessage(
	ctx: IExecuteFunctions,
	i: number,
	phoneNumberId: string,
	operation: string,
): Promise<IDataObject> {
	const to = ctx.getNodeParameter('recipientPhone', i) as string;

	const body: IDataObject = {
		messaging_product: 'whatsapp',
		to,
	};

	// Add reply context if provided (for all ops except reaction)
	if (operation !== 'sendReaction') {
		const additionalOptions = ctx.getNodeParameter('additionalOptions', i, {}) as IDataObject;
		if (additionalOptions.replyToMessageId) {
			body.context = { message_id: additionalOptions.replyToMessageId };
		}
	}

	switch (operation) {
		case 'sendText': {
			body.type = 'text';
			const textObj: IDataObject = { body: ctx.getNodeParameter('textBody', i) as string };
			const preview = ctx.getNodeParameter('previewUrl', i) as boolean;
			if (preview) textObj.preview_url = true;
			body.text = textObj;
			break;
		}
		case 'sendImage': {
			body.type = 'image';
			const imageObj: IDataObject = {};
			const source = ctx.getNodeParameter('mediaSource', i) as string;
			if (source === 'url') {
				imageObj.link = ctx.getNodeParameter('imageUrl', i) as string;
			} else {
				imageObj.id = ctx.getNodeParameter('imageMediaId', i) as string;
			}
			const caption = ctx.getNodeParameter('imageCaption', i, '') as string;
			if (caption) imageObj.caption = caption;
			body.image = imageObj;
			break;
		}
		case 'sendDocument': {
			body.type = 'document';
			const docObj: IDataObject = {};
			const source = ctx.getNodeParameter('mediaSource', i) as string;
			if (source === 'url') {
				docObj.link = ctx.getNodeParameter('documentUrl', i) as string;
			} else {
				docObj.id = ctx.getNodeParameter('documentMediaId', i) as string;
			}
			const docCaption = ctx.getNodeParameter('documentCaption', i, '') as string;
			if (docCaption) docObj.caption = docCaption;
			const filename = ctx.getNodeParameter('documentFilename', i, '') as string;
			if (filename) docObj.filename = filename;
			body.document = docObj;
			break;
		}
		case 'sendAudio': {
			body.type = 'audio';
			const audioObj: IDataObject = {};
			const source = ctx.getNodeParameter('mediaSource', i) as string;
			if (source === 'url') {
				audioObj.link = ctx.getNodeParameter('audioUrl', i) as string;
			} else {
				audioObj.id = ctx.getNodeParameter('audioMediaId', i) as string;
			}
			body.audio = audioObj;
			break;
		}
		case 'sendVideo': {
			body.type = 'video';
			const videoObj: IDataObject = {};
			const source = ctx.getNodeParameter('mediaSource', i) as string;
			if (source === 'url') {
				videoObj.link = ctx.getNodeParameter('videoUrl', i) as string;
			} else {
				videoObj.id = ctx.getNodeParameter('videoMediaId', i) as string;
			}
			const vidCaption = ctx.getNodeParameter('videoCaption', i, '') as string;
			if (vidCaption) videoObj.caption = vidCaption;
			body.video = videoObj;
			break;
		}
		case 'sendLocation': {
			body.type = 'location';
			const locObj: IDataObject = {
				latitude: ctx.getNodeParameter('latitude', i) as string,
				longitude: ctx.getNodeParameter('longitude', i) as string,
			};
			const name = ctx.getNodeParameter('locationName', i, '') as string;
			if (name) locObj.name = name;
			const address = ctx.getNodeParameter('locationAddress', i, '') as string;
			if (address) locObj.address = address;
			body.location = locObj;
			break;
		}
		case 'sendContacts': {
			body.type = 'contacts';
			const contactData = ctx.getNodeParameter('contacts', i, {}) as IDataObject;
			const contactValues = (contactData.contactValues as IDataObject[]) ?? [];
			const formattedContacts = contactValues.map((c) => {
				const contact: IDataObject = {
					name: {
						formatted_name: c.formattedName,
						...(c.firstName ? { first_name: c.firstName } : {}),
						...(c.lastName ? { last_name: c.lastName } : {}),
					},
					phones: [
						{
							phone: c.phone,
							type: c.phoneType ?? 'CELL',
						},
					],
				};
				return contact;
			});
			body.contacts = formattedContacts;
			break;
		}
		case 'sendTemplate': {
			body.type = 'template';
			const templateObj: IDataObject = {
				name: ctx.getNodeParameter('templateName', i) as string,
				language: { code: ctx.getNodeParameter('templateLanguageCode', i) as string },
			};
			const componentsJson = ctx.getNodeParameter('templateComponents', i, '[]') as string;
			const components = JSON.parse(typeof componentsJson === 'string' ? componentsJson : JSON.stringify(componentsJson));
			if (Array.isArray(components) && components.length > 0) {
				templateObj.components = components;
			}
			body.template = templateObj;
			break;
		}
		case 'sendButtons': {
			body.type = 'interactive';
			const interactive: IDataObject = {
				type: 'button',
				body: { text: ctx.getNodeParameter('buttonsBodyText', i) as string },
			};
			const header = ctx.getNodeParameter('buttonsHeaderText', i, '') as string;
			if (header) interactive.header = { type: 'text', text: header };
			const footer = ctx.getNodeParameter('buttonsFooterText', i, '') as string;
			if (footer) interactive.footer = { text: footer };

			const buttonData = ctx.getNodeParameter('buttons', i, {}) as IDataObject;
			const buttonValues = (buttonData.buttonValues as IDataObject[]) ?? [];
			interactive.action = {
				buttons: buttonValues.map((b) => ({
					type: 'reply',
					reply: {
						id: b.buttonId,
						title: b.buttonTitle,
					},
				})),
			};
			body.interactive = interactive;
			break;
		}
		case 'sendList': {
			body.type = 'interactive';
			const interactive: IDataObject = {
				type: 'list',
				body: { text: ctx.getNodeParameter('listBodyText', i) as string },
			};
			const header = ctx.getNodeParameter('listHeaderText', i, '') as string;
			if (header) interactive.header = { type: 'text', text: header };
			const footer = ctx.getNodeParameter('listFooterText', i, '') as string;
			if (footer) interactive.footer = { text: footer };

			const sectionData = ctx.getNodeParameter('listSections', i, {}) as IDataObject;
			const sectionValues = (sectionData.sectionValues as IDataObject[]) ?? [];
			const sections = sectionValues.map((s) => {
				const rowsJson = s.rows as string;
				const rows = JSON.parse(typeof rowsJson === 'string' ? rowsJson : JSON.stringify(rowsJson));
				return {
					title: s.sectionTitle,
					rows,
				};
			});

			interactive.action = {
				button: ctx.getNodeParameter('listButtonText', i) as string,
				sections,
			};
			body.interactive = interactive;
			break;
		}
		case 'sendReaction': {
			body.type = 'reaction';
			body.reaction = {
				message_id: ctx.getNodeParameter('reactionMessageId', i) as string,
				emoji: ctx.getNodeParameter('reactionEmoji', i) as string,
			};
			break;
		}
	}

	return await synergyConnectApiRequest.call(
		ctx,
		'POST',
		`/${phoneNumberId}/messages`,
		body,
	);
}

async function handleMedia(
	ctx: IExecuteFunctions,
	i: number,
	phoneNumberId: string,
	operation: string,
): Promise<IDataObject> {
	switch (operation) {
		case 'upload': {
			const binaryPropertyName = ctx.getNodeParameter('binaryPropertyName', i) as string;
			const mimeType = ctx.getNodeParameter('mimeType', i) as string;
			const binaryData = await ctx.helpers.getBinaryDataBuffer(i, binaryPropertyName);

			return await ctx.helpers.httpRequestWithAuthentication.call(
				ctx,
				'synergyConnectApi',
				{
					method: 'POST',
					url: `https://synergyconnect.com.br/api/v1/${phoneNumberId}/media`,
					body: {
						messaging_product: 'whatsapp',
						type: mimeType,
						file: {
							value: binaryData,
							options: {
								filename: 'file',
								contentType: mimeType,
							},
						},
					},
					headers: {
						'Content-Type': 'multipart/form-data',
					},
					json: true,
				},
			) as IDataObject;
		}
		case 'getInfo': {
			const mediaId = ctx.getNodeParameter('mediaId', i) as string;
			return await synergyConnectApiRequest.call(ctx, 'GET', `/${mediaId}`);
		}
		case 'download': {
			const mediaUrl = ctx.getNodeParameter('mediaUrl', i) as string;
			const response = await ctx.helpers.httpRequestWithAuthentication.call(
				ctx,
				'synergyConnectApi',
				{
					method: 'GET',
					url: `https://synergyconnect.com.br/api/v1/media/download`,
					qs: { url: mediaUrl },
					encoding: 'arraybuffer',
					returnFullResponse: true,
				},
			) as { body: Buffer; headers: Record<string, string> };

			const contentType = response.headers?.['content-type'] ?? 'application/octet-stream';
			const binaryData = await ctx.helpers.prepareBinaryData(
				Buffer.from(response.body),
				'file',
				contentType,
			);

			return { json: {}, binary: { data: binaryData } } as unknown as IDataObject;
		}
		case 'delete': {
			const mediaId = ctx.getNodeParameter('deleteMediaId', i) as string;
			return await synergyConnectApiRequest.call(ctx, 'DELETE', `/${mediaId}`);
		}
		default:
			throw new NodeOperationError(ctx.getNode(), `Unknown media operation: ${operation}`);
	}
}

async function handleTemplate(
	ctx: IExecuteFunctions,
	i: number,
	wabaId: string,
	operation: string,
): Promise<IDataObject> {
	if (!wabaId) {
		throw new NodeOperationError(ctx.getNode(), 'WABA ID is required for template operations. Please add it to your Synergy Connect credentials.', { itemIndex: i });
	}

	switch (operation) {
		case 'list': {
			const qs: IDataObject = {};
			const limit = ctx.getNodeParameter('limit', i, 20) as number;
			if (limit) qs.limit = limit;
			const status = ctx.getNodeParameter('statusFilter', i, '') as string;
			if (status) qs.status = status;
			const name = ctx.getNodeParameter('nameFilter', i, '') as string;
			if (name) qs.name = name;
			return await synergyConnectApiRequest.call(ctx, 'GET', `/${wabaId}/message_templates`, {}, qs);
		}
		case 'create': {
			const body: IDataObject = {
				name: ctx.getNodeParameter('createTemplateName', i) as string,
				language: ctx.getNodeParameter('createTemplateLanguage', i) as string,
				category: ctx.getNodeParameter('createTemplateCategory', i) as string,
				components: JSON.parse(ctx.getNodeParameter('createTemplateComponents', i) as string),
			};
			return await synergyConnectApiRequest.call(ctx, 'POST', `/${wabaId}/message_templates`, body);
		}
		case 'get': {
			const templateId = ctx.getNodeParameter('getTemplateId', i) as string;
			return await synergyConnectApiRequest.call(ctx, 'GET', `/templates/${templateId}`);
		}
		case 'update': {
			const templateId = ctx.getNodeParameter('updateTemplateId', i) as string;
			const components = JSON.parse(ctx.getNodeParameter('updateTemplateComponents', i) as string);
			return await synergyConnectApiRequest.call(ctx, 'POST', `/templates/${templateId}`, { components } as IDataObject);
		}
		case 'delete': {
			const templateName = ctx.getNodeParameter('deleteTemplateName', i) as string;
			return await synergyConnectApiRequest.call(ctx, 'DELETE', `/${wabaId}/message_templates`, {}, { name: templateName });
		}
		default:
			throw new NodeOperationError(ctx.getNode(), `Unknown template operation: ${operation}`);
	}
}

export class SynergyConnect implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Synergy Connect',
		name: 'synergyConnect',
		icon: 'file:synergyConnect.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + " (" + $parameter["resource"] + ")"}}',
		description: 'Send WhatsApp messages and manage media/templates via Synergy Connect',
		defaults: {
			name: 'Synergy Connect',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'synergyConnectApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Message', value: 'message' },
					{ name: 'Media', value: 'media' },
					{ name: 'Template', value: 'template' },
				],
				default: 'message',
			},
			...messageOperations,
			...mediaOperations,
			...templateOperations,
			...messageFields,
			...mediaFields,
			...templateFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		const credentials = await this.getCredentials('synergyConnectApi');
		const phoneNumberId = credentials.phoneNumberId as string;
		const wabaId = credentials.wabaId as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject;

				if (resource === 'message') {
					responseData = await handleMessage(this, i, phoneNumberId, operation);
				} else if (resource === 'media') {
					responseData = await handleMedia(this, i, phoneNumberId, operation);
				} else if (resource === 'template') {
					responseData = await handleTemplate(this, i, wabaId, operation);
				} else {
					throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`, { itemIndex: i });
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: (error as Error).message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
