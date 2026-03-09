import type {
	IDataObject,
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
	INodeExecutionData,
} from 'n8n-workflow';

import { synergyConnectApiRequest } from '../SynergyConnect/GenericFunctions';

const EVENT_LABELS: Record<string, string> = {
	messages: 'Messages',
	statuses: 'Statuses',
	message_template_status_update: 'Template Status',
	group_lifecycle_update: 'Group Lifecycle',
	group_settings_update: 'Group Settings',
	group_participant_update: 'Group Participants',
};

const MESSAGE_SUBTYPES = [
	'Text',
	'Image',
	'Video',
	'Audio',
	'Document',
	'Sticker',
	'Location',
	'Contacts',
	'Interactive',
	'Reaction',
	'Other Messages',
] as const;

const SUBTYPE_MAP: Record<string, number> = {
	text: 0,
	image: 1,
	video: 2,
	audio: 3,
	document: 4,
	sticker: 5,
	location: 6,
	contacts: 7,
	interactive: 8,
	reaction: 9,
};

// Helper: build the ordered list of output labels for a given config
function buildOutputLabels(events: string[], outputMode: string): string[] {
	if (outputMode === 'single') return ['All Events'];

	const labels: string[] = [];
	for (const e of events) {
		if (outputMode === 'perMessageSubtype' && e === 'messages') {
			labels.push(...MESSAGE_SUBTYPES);
		} else {
			labels.push(EVENT_LABELS[e] ?? e);
		}
	}
	return labels;
}

export class SynergyConnectTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Synergy Connect Trigger',
		name: 'synergyConnectTrigger',
		icon: 'file:synergyConnect.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"].join(", ")}}',
		description: 'Receives WhatsApp events from Synergy Connect',
		defaults: {
			name: 'Synergy Connect Trigger',
		},
		inputs: [],
		outputs: `={{
			((events, mode) => {
				if (mode === "single") return [{ type: "main", displayName: "All Events" }];
				const SUBTYPES = ["Text","Image","Video","Audio","Document","Sticker","Location","Contacts","Interactive","Reaction","Other Messages"];
				const LABELS = { messages: "Messages", statuses: "Statuses", message_template_status_update: "Template Status", group_lifecycle_update: "Group Lifecycle", group_settings_update: "Group Settings", group_participant_update: "Group Participants" };
				const out = [];
				for (const e of events) {
					if (mode === "perMessageSubtype" && e === "messages") {
						SUBTYPES.forEach(s => out.push({ type: "main", displayName: s }));
					} else {
						out.push({ type: "main", displayName: LABELS[e] || e });
					}
				}
				return out;
			})($parameter["events"] || ["messages"], $parameter["outputMode"] || "single")
		}}` as const,
		credentials: [
			{
				name: 'synergyConnectApi',
				required: true,
			},
		],
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
				default: ['messages'],
				options: [
					{
						name: 'Group Lifecycle Update',
						value: 'group_lifecycle_update',
						description: 'Triggered when a group is created or deleted',
					},
					{
						name: 'Group Participant Update',
						value: 'group_participant_update',
						description: 'Triggered when participants join or leave a group',
					},
					{
						name: 'Group Settings Update',
						value: 'group_settings_update',
						description: 'Triggered when group settings are changed',
					},
					{
						name: 'Message Status Update',
						value: 'statuses',
						description: 'Triggered when a message status changes (sent, delivered, read, failed)',
					},
					{
						name: 'Messages Received',
						value: 'messages',
						description: 'Triggered when an incoming message is received',
					},
					{
						name: 'Template Status Update',
						value: 'message_template_status_update',
						description: 'Triggered when a template status changes (approved, rejected)',
					},
				],
				description: 'Which events to listen for',
			},
			{
				displayName: 'Output Mode',
				name: 'outputMode',
				type: 'options',
				default: 'single',
				options: [
					{
						name: 'Single Output',
						value: 'single',
						description: 'All events go through a single output',
					},
					{
						name: 'Separate by Event Type',
						value: 'perEventType',
						description: 'One output branch per selected event type',
					},
					{
						name: 'Separate by Message Subtype',
						value: 'perMessageSubtype',
						description: 'One output per message subtype (text, image, etc.) and one per other event type',
					},
				],
				description: 'How to organize the output branches of this trigger',
			},
		],
		usableAsTool: true,
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const workflowId = this.getWorkflow().id;

				await synergyConnectApiRequest.call(this, 'PUT', '/webhooks', {
					url: webhookUrl,
					name: `n8n-workflow-${workflowId}`,
					enabled: true,
				} as unknown as IDataObject);

				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const workflowId = this.getWorkflow().id;

				try {
					await synergyConnectApiRequest.call(this, 'PUT', '/webhooks', {
						url: webhookUrl,
						name: `n8n-workflow-${workflowId}`,
						enabled: false,
					} as unknown as IDataObject);
				} catch {
					return false;
				}
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData() as IDataObject;
		const events = this.getNodeParameter('events', []) as string[];
		const outputMode = this.getNodeParameter('outputMode', 'single') as string;

		const outputLabels = buildOutputLabels(events, outputMode);
		const outputCount = outputLabels.length;

		// Initialize output arrays — one per output branch
		const workflowData: INodeExecutionData[][] = Array.from({ length: outputCount }, () => []);

		const entry = (body.entry as IDataObject[] | undefined) ?? [];

		for (const entryItem of entry) {
			const wabaId = entryItem.id as string;
			const changes = (entryItem.changes as IDataObject[] | undefined) ?? [];

			for (const change of changes) {
				const field = change.field as string;
				const value = change.value as IDataObject;

				// The "messages" field contains both incoming messages and status updates
				// We need to split them based on what's in value
				if (field === 'messages') {
					// Handle incoming messages
					const incomingMessages = (value.messages as IDataObject[] | undefined) ?? [];
					const contactsInfo = (value.contacts as IDataObject[] | undefined) ?? [];
					const metadata = value.metadata as IDataObject | undefined;

					if (incomingMessages.length > 0 && events.includes('messages')) {
						for (const msg of incomingMessages) {
							const messageType = (msg.type as string) ?? 'unsupported';
							const item: IDataObject = {
								...msg,
								_eventType: 'messages',
								_messageType: messageType,
								_wabaId: wabaId,
								_metadata: metadata,
								_contact: contactsInfo[0] ?? null,
							};

							const outputIndex = getOutputIndex('messages', messageType, events, outputMode, outputLabels);
							if (outputIndex !== -1) {
								workflowData[outputIndex].push({ json: item });
							}
						}
					}

					// Handle status updates
					const statuses = (value.statuses as IDataObject[] | undefined) ?? [];
					if (statuses.length > 0 && events.includes('statuses')) {
						for (const status of statuses) {
							const item: IDataObject = {
								...status,
								_eventType: 'statuses',
								_wabaId: wabaId,
								_metadata: metadata,
							};

							const outputIndex = getOutputIndex('statuses', undefined, events, outputMode, outputLabels);
							if (outputIndex !== -1) {
								workflowData[outputIndex].push({ json: item });
							}
						}
					}
				} else {
					// Non-message events (template status, group events)
					if (!events.includes(field)) continue;

					const item: IDataObject = {
						...value,
						_eventType: field,
						_wabaId: wabaId,
					};

					const outputIndex = getOutputIndex(field, undefined, events, outputMode, outputLabels);
					if (outputIndex !== -1) {
						workflowData[outputIndex].push({ json: item });
					}
				}
			}
		}

		// Check if any output has data
		const hasData = workflowData.some((output) => output.length > 0);
		if (!hasData) {
			return { workflowData: [this.helpers.returnJsonArray([])] };
		}

		return { workflowData };
	}
}

function getOutputIndex(
	eventType: string,
	messageType: string | undefined,
	events: string[],
	outputMode: string,
	outputLabels: string[],
): number {
	if (outputMode === 'single') return 0;

	if (outputMode === 'perMessageSubtype' && eventType === 'messages' && messageType) {
		const subtypeIndex = SUBTYPE_MAP[messageType];
		// Find where message subtypes start in the output labels
		const messagesStartIndex = outputLabels.indexOf('Text');
		if (messagesStartIndex === -1) return -1;

		if (subtypeIndex !== undefined) {
			return messagesStartIndex + subtypeIndex;
		}
		// Unknown subtype → "Other Messages"
		const otherIndex = outputLabels.indexOf('Other Messages');
		return otherIndex !== -1 ? otherIndex : -1;
	}

	// For perEventType or non-message events in perMessageSubtype
	const label = EVENT_LABELS[eventType] ?? eventType;
	return outputLabels.indexOf(label);
}
