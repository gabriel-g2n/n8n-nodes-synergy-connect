# n8n-nodes-synergy-connect

Community nodes for [n8n](https://n8n.io/) that integrate with [Synergy Connect](https://synergyconnect.com.br/) — a proxy for the WhatsApp Business Cloud API.

These nodes allow you to send and receive WhatsApp messages directly from your n8n workflows using the Synergy Connect platform.

![n8n](https://img.shields.io/badge/n8n-community%20node-ff6d5a)
![license](https://img.shields.io/npm/l/n8n-nodes-synergy-connect)

## Nodes

### Synergy Connect Trigger

Receives WhatsApp events in real time via webhook.

- Auto-registers the webhook on Synergy Connect when the workflow is activated
- Auto-disables the webhook when the workflow is deactivated
- Filters events by type:
  - **Message Received** — incoming messages and status updates (sent, delivered, read)
  - **Template Status Update** — template approval/rejection notifications

### Synergy Connect

Sends WhatsApp messages and manages media and templates.

**Message** — send all WhatsApp message types:

| Type | Description |
|------|-------------|
| Text | Plain text with optional URL preview |
| Image | Via public URL or media ID, with optional caption |
| Document | Via URL or media ID, with caption and filename |
| Audio | Via URL or media ID |
| Video | Via URL or media ID, with optional caption |
| Location | Latitude, longitude, name and address |
| Contacts | One or more contact cards |
| Template | Pre-approved message templates with parameters |
| Buttons | Interactive message with up to 3 reply buttons |
| List | Interactive message with selectable list sections |
| Reaction | React to a message with an emoji |

All message types support replying/quoting a previous message.

**Media** — manage media files:
- Upload, Get Info, Download, Delete

**Template** — manage message templates:
- List, Create, Get, Update, Delete

## Installation

### In n8n (recommended)

1. Go to **Settings > Community Nodes**
2. Click **Install a community node**
3. Enter `n8n-nodes-synergy-connect`
4. Click **Install**

### Via npm

```bash
npm install n8n-nodes-synergy-connect
```

## Credentials

You need a Synergy Connect API key to use these nodes. Get yours at [synergyconnect.com.br](https://synergyconnect.com.br/).

| Field | Required | Description |
|-------|----------|-------------|
| API Key | Yes | Your Synergy Connect API key (starts with `sk_`) |
| Phone Number ID | Yes | Phone Number ID of your WhatsApp instance |
| WABA ID | No | WhatsApp Business Account ID (required for template operations) |

## Usage

### Receiving messages (Trigger)

1. Add the **Synergy Connect Trigger** node to your workflow
2. Configure your credentials
3. Select which events to listen for
4. Activate the workflow — the webhook is registered automatically

### Sending messages

1. Add the **Synergy Connect** node to your workflow
2. Configure your credentials
3. Select **Message** as resource and choose the message type
4. Fill in the recipient phone number and message content
5. Execute the workflow

## Links

- [Synergy Connect](https://synergyconnect.com.br/)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

[MIT](LICENSE)
