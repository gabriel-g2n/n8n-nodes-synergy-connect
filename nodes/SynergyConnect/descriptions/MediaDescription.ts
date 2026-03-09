import type { INodeProperties } from 'n8n-workflow';

export const mediaOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['media'],
			},
		},
		options: [
			{ name: 'Upload', value: 'upload', action: 'Upload media', description: 'Upload a media file for use in messages' },
			{ name: 'Get Info', value: 'getInfo', action: 'Get media info', description: 'Get metadata of an uploaded media file' },
			{ name: 'Download', value: 'download', action: 'Download media', description: 'Download a media file' },
			{ name: 'Delete', value: 'delete', action: 'Delete media', description: 'Delete an uploaded media file' },
		],
		default: 'upload',
	},
];

export const mediaFields: INodeProperties[] = [
	// Upload
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property containing the file to upload',
		displayOptions: {
			show: {
				resource: ['media'],
				operation: ['upload'],
			},
		},
	},
	{
		displayName: 'MIME Type',
		name: 'mimeType',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'image/jpeg',
		description: 'MIME type of the file (e.g. image/jpeg, application/pdf, video/mp4)',
		displayOptions: {
			show: {
				resource: ['media'],
				operation: ['upload'],
			},
		},
	},
	// Get Info
	{
		displayName: 'Media ID',
		name: 'mediaId',
		type: 'string',
		required: true,
		default: '',
		description: 'ID of the media to retrieve info for',
		displayOptions: {
			show: {
				resource: ['media'],
				operation: ['getInfo'],
			},
		},
	},
	// Download
	{
		displayName: 'Media URL',
		name: 'mediaUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'The media URL obtained from the Get Info operation',
		displayOptions: {
			show: {
				resource: ['media'],
				operation: ['download'],
			},
		},
	},
	// Delete
	{
		displayName: 'Media ID',
		name: 'deleteMediaId',
		type: 'string',
		required: true,
		default: '',
		description: 'ID of the media to delete',
		displayOptions: {
			show: {
				resource: ['media'],
				operation: ['delete'],
			},
		},
	},
];
