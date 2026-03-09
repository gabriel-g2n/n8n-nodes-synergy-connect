import type { INodeProperties } from 'n8n-workflow';

export const templateOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['template'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create a template', description: 'Create a new message template' },
			{ name: 'Delete', value: 'delete', action: 'Delete a template', description: 'Delete a template by name' },
			{ name: 'Get', value: 'get', action: 'Get a template', description: 'Get a template by ID' },
			{ name: 'List', value: 'list', action: 'List templates', description: 'List message templates' },
			{ name: 'Update', value: 'update', action: 'Update a template', description: 'Update a template by ID' },
		],
		default: 'list',
	},
];

export const templateFields: INodeProperties[] = [
	// List - filters
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		description: 'Max number of results to return',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['list'],
			},
		},
	},
	{
		displayName: 'Status Filter',
		name: 'statusFilter',
		type: 'options',
		options: [
			{ name: 'All', value: '' },
			{ name: 'Approved', value: 'APPROVED' },
			{ name: 'Pending', value: 'PENDING' },
			{ name: 'Rejected', value: 'REJECTED' },
		],
		default: '',
		description: 'Filter templates by status',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['list'],
			},
		},
	},
	{
		displayName: 'Name Filter',
		name: 'nameFilter',
		type: 'string',
		default: '',
		description: 'Filter templates by name',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['list'],
			},
		},
	},
	// Create
	{
		displayName: 'Template Name',
		name: 'createTemplateName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'my_template',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Language',
		name: 'createTemplateLanguage',
		type: 'string',
		required: true,
		default: 'pt_BR',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Category',
		name: 'createTemplateCategory',
		type: 'options',
		options: [
			{ name: 'Marketing', value: 'MARKETING' },
			{ name: 'Utility', value: 'UTILITY' },
			{ name: 'Authentication', value: 'AUTHENTICATION' },
		],
		required: true,
		default: 'UTILITY',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Components (JSON)',
		name: 'createTemplateComponents',
		type: 'json',
		required: true,
		default: '[{"type":"BODY","text":"Hello {{1}}!"}]',
		description: 'JSON array of template components following Meta format',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['create'],
			},
		},
	},
	// Get
	{
		displayName: 'Template ID',
		name: 'getTemplateId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['get'],
			},
		},
	},
	// Update
	{
		displayName: 'Template ID',
		name: 'updateTemplateId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['update'],
			},
		},
	},
	{
		displayName: 'Components (JSON)',
		name: 'updateTemplateComponents',
		type: 'json',
		required: true,
		default: '[]',
		description: 'Updated template components in JSON format',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['update'],
			},
		},
	},
	// Delete
	{
		displayName: 'Template Name',
		name: 'deleteTemplateName',
		type: 'string',
		required: true,
		default: '',
		description: 'Name of the template to delete',
		displayOptions: {
			show: {
				resource: ['template'],
				operation: ['delete'],
			},
		},
	},
];
