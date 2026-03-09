import type { INodeProperties } from 'n8n-workflow';

export const messageOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['message'],
			},
		},
		options: [
			{ name: 'Send Audio', value: 'sendAudio', action: 'Send an audio message', description: 'Send an audio file via URL or media ID' },
			{ name: 'Send Buttons', value: 'sendButtons', action: 'Send an interactive button message', description: 'Send a message with reply buttons (max 3)' },
			{ name: 'Send Contacts', value: 'sendContacts', action: 'Send contacts', description: 'Send one or more contact cards' },
			{ name: 'Send Document', value: 'sendDocument', action: 'Send a document', description: 'Send a document file via URL or media ID' },
			{ name: 'Send Image', value: 'sendImage', action: 'Send an image message', description: 'Send an image via URL or media ID' },
			{ name: 'Send List', value: 'sendList', action: 'Send an interactive list message', description: 'Send a message with a selectable list' },
			{ name: 'Send Location', value: 'sendLocation', action: 'Send a location', description: 'Send a geographic location' },
			{ name: 'Send Reaction', value: 'sendReaction', action: 'Send a reaction', description: 'React to a message with an emoji' },
			{ name: 'Send Template', value: 'sendTemplate', action: 'Send a template message', description: 'Send a pre-approved message template' },
			{ name: 'Send Text', value: 'sendText', action: 'Send a text message', description: 'Send a text message to a WhatsApp number' },
			{ name: 'Send Video', value: 'sendVideo', action: 'Send a video message', description: 'Send a video via URL or media ID' },
		],
		default: 'sendText',
	},
];

const recipientPhone: INodeProperties = {
	displayName: 'Recipient Phone Number',
	name: 'recipientPhone',
	type: 'string',
	required: true,
	default: '',
	placeholder: '5511999999999',
	description: 'The WhatsApp phone number to send the message to (with country code, no + sign)',
	displayOptions: {
		show: {
			resource: ['message'],
		},
	},
};

// ── Text ──

const textBody: INodeProperties = {
	displayName: 'Message Text',
	name: 'textBody',
	type: 'string',
	typeOptions: { rows: 4 },
	required: true,
	default: '',
	description: 'The text content of the message',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendText'],
		},
	},
};

const previewUrl: INodeProperties = {
	displayName: 'Preview URL',
	name: 'previewUrl',
	type: 'boolean',
	default: false,
	description: 'Whether to show a URL preview in the message',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendText'],
		},
	},
};

// ── Media Source (shared for image, document, audio, video) ──

const mediaSource: INodeProperties = {
	displayName: 'Media Source',
	name: 'mediaSource',
	type: 'options',
	options: [
		{ name: 'URL', value: 'url' },
		{ name: 'Media ID', value: 'mediaId' },
	],
	default: 'url',
	description: 'Whether to send the media via a public URL or a previously uploaded media ID',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendImage', 'sendDocument', 'sendAudio', 'sendVideo'],
		},
	},
};

// ── Image ──

const imageUrl: INodeProperties = {
	displayName: 'Image URL',
	name: 'imageUrl',
	type: 'string',
	required: true,
	default: '',
	placeholder: 'https://example.com/image.jpg',
	description: 'Public URL of the image to send',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendImage'],
			mediaSource: ['url'],
		},
	},
};

const imageMediaId: INodeProperties = {
	displayName: 'Image Media ID',
	name: 'imageMediaId',
	type: 'string',
	required: true,
	default: '',
	description: 'Media ID from a previous upload',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendImage'],
			mediaSource: ['mediaId'],
		},
	},
};

const imageCaption: INodeProperties = {
	displayName: 'Caption',
	name: 'imageCaption',
	type: 'string',
	default: '',
	description: 'Optional caption for the image',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendImage'],
		},
	},
};

// ── Document ──

const documentUrl: INodeProperties = {
	displayName: 'Document URL',
	name: 'documentUrl',
	type: 'string',
	required: true,
	default: '',
	placeholder: 'https://example.com/file.pdf',
	description: 'Public URL of the document to send',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendDocument'],
			mediaSource: ['url'],
		},
	},
};

const documentMediaId: INodeProperties = {
	displayName: 'Document Media ID',
	name: 'documentMediaId',
	type: 'string',
	required: true,
	default: '',
	description: 'Media ID from a previous upload',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendDocument'],
			mediaSource: ['mediaId'],
		},
	},
};

const documentCaption: INodeProperties = {
	displayName: 'Caption',
	name: 'documentCaption',
	type: 'string',
	default: '',
	description: 'Optional caption for the document',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendDocument'],
		},
	},
};

const documentFilename: INodeProperties = {
	displayName: 'Filename',
	name: 'documentFilename',
	type: 'string',
	default: '',
	placeholder: 'report.pdf',
	description: 'Filename to display in the message',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendDocument'],
		},
	},
};

// ── Audio ──

const audioUrl: INodeProperties = {
	displayName: 'Audio URL',
	name: 'audioUrl',
	type: 'string',
	required: true,
	default: '',
	placeholder: 'https://example.com/audio.mp3',
	description: 'Public URL of the audio file',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendAudio'],
			mediaSource: ['url'],
		},
	},
};

const audioMediaId: INodeProperties = {
	displayName: 'Audio Media ID',
	name: 'audioMediaId',
	type: 'string',
	required: true,
	default: '',
	description: 'Media ID from a previous upload',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendAudio'],
			mediaSource: ['mediaId'],
		},
	},
};

// ── Video ──

const videoUrl: INodeProperties = {
	displayName: 'Video URL',
	name: 'videoUrl',
	type: 'string',
	required: true,
	default: '',
	placeholder: 'https://example.com/video.mp4',
	description: 'Public URL of the video',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendVideo'],
			mediaSource: ['url'],
		},
	},
};

const videoMediaId: INodeProperties = {
	displayName: 'Video Media ID',
	name: 'videoMediaId',
	type: 'string',
	required: true,
	default: '',
	description: 'Media ID from a previous upload',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendVideo'],
			mediaSource: ['mediaId'],
		},
	},
};

const videoCaption: INodeProperties = {
	displayName: 'Caption',
	name: 'videoCaption',
	type: 'string',
	default: '',
	description: 'Optional caption for the video',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendVideo'],
		},
	},
};

// ── Location ──

const latitude: INodeProperties = {
	displayName: 'Latitude',
	name: 'latitude',
	type: 'string',
	required: true,
	default: '',
	placeholder: '-23.5505',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendLocation'],
		},
	},
};

const longitude: INodeProperties = {
	displayName: 'Longitude',
	name: 'longitude',
	type: 'string',
	required: true,
	default: '',
	placeholder: '-46.6333',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendLocation'],
		},
	},
};

const locationName: INodeProperties = {
	displayName: 'Location Name',
	name: 'locationName',
	type: 'string',
	default: '',
	placeholder: 'São Paulo',
	description: 'Name of the location',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendLocation'],
		},
	},
};

const locationAddress: INodeProperties = {
	displayName: 'Address',
	name: 'locationAddress',
	type: 'string',
	default: '',
	placeholder: 'Av. Paulista, 1000',
	description: 'Address of the location',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendLocation'],
		},
	},
};

// ── Contacts ──

const contacts: INodeProperties = {
	displayName: 'Contacts',
	name: 'contacts',
	type: 'fixedCollection',
	typeOptions: { multipleValues: true },
	default: {},
	placeholder: 'Add Contact',
	description: 'Contact cards to send',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendContacts'],
		},
	},
	options: [
		{
			name: 'contactValues',
			displayName: 'Contact',
			values: [
				{
					displayName: 'First Name',
					name: 'firstName',
					type: 'string',
					default: '',
				},
				{
					displayName: 'Full Name',
					name: 'formattedName',
					type: 'string',
						required:	true,
					default: '',
					description: 'Full formatted name of the contact',
				},
				{
					displayName: 'Last Name',
					name: 'lastName',
					type: 'string',
					default: '',
				},
				{
					displayName: 'Phone Number',
					name: 'phone',
					type: 'string',
						required:	true,
					default: '',
					placeholder: '+5511988888888',
					description: 'Phone number of the contact',
				},
				{
					displayName: 'Phone Type',
					name: 'phoneType',
					type: 'options',
					options: [
						{
							name: 'Cell',
							value: 'CELL',
						},
						{
							name: 'Main',
							value: 'MAIN',
						},
						{
							name: 'Home',
							value: 'HOME',
						},
						{
							name: 'Work',
							value: 'WORK',
						},
					],
					default: 'CELL',
				},
			],
		},
	],
};

// ── Template ──

const templateName: INodeProperties = {
	displayName: 'Template Name',
	name: 'templateName',
	type: 'string',
	required: true,
	default: '',
	placeholder: 'hello_world',
	description: 'The name of the approved message template',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendTemplate'],
		},
	},
};

const templateLanguageCode: INodeProperties = {
	displayName: 'Language Code',
	name: 'templateLanguageCode',
	type: 'string',
	required: true,
	default: 'pt_BR',
	description: 'Language code for the template (e.g. pt_BR, en_US)',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendTemplate'],
		},
	},
};

const templateComponents: INodeProperties = {
	displayName: 'Template Components (JSON)',
	name: 'templateComponents',
	type: 'json',
	default: '[]',
	description: 'JSON array of template component objects following Meta format. Example: [{"type":"body","parameters":[{"type":"text","text":"John"}]}].',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendTemplate'],
		},
	},
};

// ── Interactive Buttons ──

const buttonsBodyText: INodeProperties = {
	displayName: 'Body Text',
	name: 'buttonsBodyText',
	type: 'string',
	typeOptions: { rows: 3 },
	required: true,
	default: '',
	description: 'The main text of the button message',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendButtons'],
		},
	},
};

const buttonsHeaderText: INodeProperties = {
	displayName: 'Header Text',
	name: 'buttonsHeaderText',
	type: 'string',
	default: '',
	description: 'Optional header text displayed above the body',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendButtons'],
		},
	},
};

const buttonsFooterText: INodeProperties = {
	displayName: 'Footer Text',
	name: 'buttonsFooterText',
	type: 'string',
	default: '',
	description: 'Optional footer text displayed below the body',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendButtons'],
		},
	},
};

const buttons: INodeProperties = {
	displayName: 'Buttons',
	name: 'buttons',
	type: 'fixedCollection',
	typeOptions: { multipleValues: true },
	default: {},
	placeholder: 'Add Button',
	description: 'Reply buttons (max 3)',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendButtons'],
		},
	},
	options: [
		{
			name: 'buttonValues',
			displayName: 'Button',
			values: [
				{
					displayName: 'Button ID',
					name: 'buttonId',
					type: 'string',
					required: true,
					default: '',
					description: 'Unique identifier for the button',
				},
				{
					displayName: 'Button Title',
					name: 'buttonTitle',
					type: 'string',
					required: true,
					default: '',
					description: 'Text displayed on the button (max 20 characters)',
				},
			],
		},
	],
};

// ── Interactive List ──

const listBodyText: INodeProperties = {
	displayName: 'Body Text',
	name: 'listBodyText',
	type: 'string',
	typeOptions: { rows: 3 },
	required: true,
	default: '',
	description: 'The main text of the list message',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendList'],
		},
	},
};

const listButtonText: INodeProperties = {
	displayName: 'Button Text',
	name: 'listButtonText',
	type: 'string',
	required: true,
	default: '',
	placeholder: 'View options',
	description: 'Text on the button that opens the list',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendList'],
		},
	},
};

const listHeaderText: INodeProperties = {
	displayName: 'Header Text',
	name: 'listHeaderText',
	type: 'string',
	default: '',
	description: 'Optional header text',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendList'],
		},
	},
};

const listFooterText: INodeProperties = {
	displayName: 'Footer Text',
	name: 'listFooterText',
	type: 'string',
	default: '',
	description: 'Optional footer text',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendList'],
		},
	},
};

const listSections: INodeProperties = {
	displayName: 'Sections',
	name: 'listSections',
	type: 'fixedCollection',
	typeOptions: { multipleValues: true },
	default: {},
	placeholder: 'Add Section',
	description: 'List sections with selectable rows',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendList'],
		},
	},
	options: [
		{
			name: 'sectionValues',
			displayName: 'Section',
			values: [
				{
					displayName: 'Section Title',
					name: 'sectionTitle',
					type: 'string',
					required: true,
					default: '',
				},
				{
					displayName: 'Rows (JSON)',
					name: 'rows',
					type: 'json',
					required: true,
					default: '[]',
					description: 'JSON array of row objects: [{"ID":"row_1","title":"Row 1","description":"Optional description"}]',
				},
			],
		},
	],
};

// ── Reaction ──

const reactionMessageId: INodeProperties = {
	displayName: 'Message ID',
	name: 'reactionMessageId',
	type: 'string',
	required: true,
	default: '',
	placeholder: 'wamid.xxxxxxxxxxxx',
	description: 'The ID of the message to react to',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendReaction'],
		},
	},
};

const reactionEmoji: INodeProperties = {
	displayName: 'Emoji',
	name: 'reactionEmoji',
	type: 'string',
	required: true,
	default: '',
	placeholder: '👍',
	description: 'The emoji to react with. Leave empty to remove reaction.',
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendReaction'],
		},
	},
};

// ── Additional Options (reply context) ──

const additionalOptions: INodeProperties = {
	displayName: 'Additional Options',
	name: 'additionalOptions',
	type: 'collection',
	placeholder: 'Add Option',
	default: {},
	displayOptions: {
		show: {
			resource: ['message'],
			operation: ['sendText', 'sendImage', 'sendDocument', 'sendAudio', 'sendVideo', 'sendLocation', 'sendContacts', 'sendTemplate', 'sendButtons', 'sendList'],
		},
	},
	options: [
		{
			displayName: 'Reply to Message ID',
			name: 'replyToMessageId',
			type: 'string',
			default: '',
			placeholder: 'wamid.xxxxxxxxxxxx',
			description: 'Message ID to reply/quote. When set, the message will be sent as a reply.',
		},
	],
};

export const messageFields: INodeProperties[] = [
	recipientPhone,
	// Text
	textBody,
	previewUrl,
	// Media source
	mediaSource,
	// Image
	imageUrl,
	imageMediaId,
	imageCaption,
	// Document
	documentUrl,
	documentMediaId,
	documentCaption,
	documentFilename,
	// Audio
	audioUrl,
	audioMediaId,
	// Video
	videoUrl,
	videoMediaId,
	videoCaption,
	// Location
	latitude,
	longitude,
	locationName,
	locationAddress,
	// Contacts
	contacts,
	// Template
	templateName,
	templateLanguageCode,
	templateComponents,
	// Buttons
	buttonsBodyText,
	buttonsHeaderText,
	buttonsFooterText,
	buttons,
	// List
	listBodyText,
	listButtonText,
	listHeaderText,
	listFooterText,
	listSections,
	// Reaction
	reactionMessageId,
	reactionEmoji,
	// Additional options
	additionalOptions,
];
