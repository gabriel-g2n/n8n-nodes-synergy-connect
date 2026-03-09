import type {
	IDataObject,
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { synergyConnectApiRequest } from '../SynergyConnect/GenericFunctions';

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
		outputs: [NodeConnectionTypes.Main],
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
						name: 'Message Received',
						value: 'messages',
						description: 'Triggered when a message is received or message status changes (sent, delivered, read)',
					},
					{
						name: 'Template Status Update',
						value: 'message_template_status_update',
						description: 'Triggered when a template status changes (approved, rejected)',
					},
				],
				description: 'Which events to listen for',
			},
		],
		usableAsTool: true,
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				// No GET endpoint to check existing webhooks.
				// Always return false so create() runs — the API uses upsert by URL, so it's safe.
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
					// Don't fail on cleanup errors
					return false;
				}
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData() as IDataObject;
		const events = this.getNodeParameter('events', []) as string[];

		// Payload follows Meta Webhook format:
		// { object, entry: [{ id, changes: [{ value, field }] }] }
		const entry = (body.entry as IDataObject[] | undefined) ?? [];
		const filteredChanges: IDataObject[] = [];

		for (const entryItem of entry) {
			const changes = (entryItem.changes as IDataObject[] | undefined) ?? [];
			for (const change of changes) {
				const field = change.field as string;
				if (events.includes(field)) {
					filteredChanges.push({
						...change.value as IDataObject,
						_eventType: field,
						_wabaId: entryItem.id,
					});
				}
			}
		}

		if (filteredChanges.length === 0) {
			// No matching events — don't trigger the workflow
			return { workflowData: [[]] };
		}

		return {
			workflowData: [this.helpers.returnJsonArray(filteredChanges)],
		};
	}
}
