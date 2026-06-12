import type { NodeCategory, NodeDefinition } from '../types/visual-workflow.types';

// ── Color Palette ────────────────────────────────────────

const COLORS = {
  trigger: '#22C55E',
  condition: '#EAB308',
  action: '#3B82F6',
  flow: '#A855F7',
  utility: '#6B7280',
} as const;

// ── Trigger Nodes ────────────────────────────────────────

const TRIGGER_NODES: NodeDefinition[] = [
  {
    type: 'trigger_event',
    label: 'Event Trigger',
    icon: 'zap',
    description: 'Fires when a CRM event occurs (lead created, stage changed, etc.)',
    category: 'trigger',
    color: COLORS.trigger,
    defaultConfig: { eventCode: '' },
    configFields: [
      {
        key: 'eventCode',
        label: 'Event',
        type: 'select',
        required: true,
        options: [], // populated at runtime from TRIGGER_EVENTS
        placeholder: 'Select a CRM event',
      },
    ],
    handles: { inputs: 0, outputs: 1 },
  },
  {
    type: 'trigger_schedule',
    label: 'Schedule Trigger',
    icon: 'clock',
    description: 'Runs on a recurring schedule (daily, weekly, cron)',
    category: 'trigger',
    color: COLORS.trigger,
    defaultConfig: { scheduleType: 'daily', cronExpression: '', time: '09:00' },
    configFields: [
      {
        key: 'scheduleType',
        label: 'Schedule Type',
        type: 'select',
        required: true,
        options: [
          { label: 'Daily', value: 'daily' },
          { label: 'Weekly', value: 'weekly' },
          { label: 'Monthly', value: 'monthly' },
          { label: 'Custom Cron', value: 'custom' },
        ],
      },
      {
        key: 'cronExpression',
        label: 'Cron Expression',
        type: 'cron',
        placeholder: '0 9 * * *',
      },
      {
        key: 'time',
        label: 'Time',
        type: 'text',
        placeholder: '09:00',
      },
    ],
    handles: { inputs: 0, outputs: 1 },
  },
  {
    type: 'trigger_webhook',
    label: 'Webhook Trigger',
    icon: 'globe',
    description: 'Fires when an external HTTP request hits the webhook URL',
    category: 'trigger',
    color: COLORS.trigger,
    defaultConfig: { method: 'POST', path: '' },
    configFields: [
      {
        key: 'method',
        label: 'HTTP Method',
        type: 'select',
        required: true,
        options: [
          { label: 'POST', value: 'POST' },
          { label: 'GET', value: 'GET' },
          { label: 'PUT', value: 'PUT' },
        ],
      },
      {
        key: 'path',
        label: 'Webhook Path',
        type: 'text',
        placeholder: '/my-webhook',
      },
    ],
    handles: { inputs: 0, outputs: 1 },
  },
  {
    type: 'trigger_manual',
    label: 'Manual Trigger',
    icon: 'play',
    description: 'Triggered manually via the UI or API call',
    category: 'trigger',
    color: COLORS.trigger,
    defaultConfig: {},
    handles: { inputs: 0, outputs: 1 },
  },
];

// ── Condition Nodes ──────────────────────────────────────

const CONDITION_NODES: NodeDefinition[] = [
  {
    type: 'condition_if',
    label: 'If / Else',
    icon: 'git-branch',
    description: 'Branch based on a condition (Yes / No)',
    category: 'condition',
    color: COLORS.condition,
    defaultConfig: { field: '', operator: 'equals', value: '' },
    configFields: [
      {
        key: 'field',
        label: 'Field',
        type: 'entity-field',
        required: true,
        placeholder: 'e.g. lead.status',
      },
      {
        key: 'operator',
        label: 'Operator',
        type: 'select',
        required: true,
        options: [
          { label: 'Equals', value: 'equals' },
          { label: 'Not Equals', value: 'not_equals' },
          { label: 'Contains', value: 'contains' },
          { label: 'Greater Than', value: 'greater_than' },
          { label: 'Less Than', value: 'less_than' },
          { label: 'Is Empty', value: 'is_empty' },
          { label: 'Is Not Empty', value: 'is_not_empty' },
        ],
      },
      {
        key: 'value',
        label: 'Value',
        type: 'text',
        placeholder: 'Compare value',
      },
    ],
    handles: { inputs: 1, outputs: ['yes', 'no'] },
  },
  {
    type: 'condition_switch',
    label: 'Switch',
    icon: 'layers',
    description: 'Branch into multiple paths based on a field value',
    category: 'condition',
    color: COLORS.condition,
    defaultConfig: { field: '', cases: [] },
    configFields: [
      {
        key: 'field',
        label: 'Field',
        type: 'entity-field',
        required: true,
        placeholder: 'e.g. lead.source',
      },
      {
        key: 'cases',
        label: 'Cases (JSON)',
        type: 'json',
        placeholder: '[{"value":"web","label":"Web"},{"value":"referral","label":"Referral"}]',
      },
    ],
    handles: { inputs: 1, outputs: ['default'] }, // dynamic outputs added per case
  },
  {
    type: 'condition_filter',
    label: 'Filter',
    icon: 'filter',
    description: 'Continue only if condition is met, otherwise stop this branch',
    category: 'condition',
    color: COLORS.condition,
    defaultConfig: { field: '', operator: 'equals', value: '' },
    configFields: [
      {
        key: 'field',
        label: 'Field',
        type: 'entity-field',
        required: true,
        placeholder: 'e.g. lead.value',
      },
      {
        key: 'operator',
        label: 'Operator',
        type: 'select',
        required: true,
        options: [
          { label: 'Equals', value: 'equals' },
          { label: 'Not Equals', value: 'not_equals' },
          { label: 'Contains', value: 'contains' },
          { label: 'Greater Than', value: 'greater_than' },
          { label: 'Less Than', value: 'less_than' },
          { label: 'Is Empty', value: 'is_empty' },
          { label: 'Is Not Empty', value: 'is_not_empty' },
        ],
      },
      {
        key: 'value',
        label: 'Value',
        type: 'text',
        placeholder: 'Compare value',
      },
    ],
    handles: { inputs: 1, outputs: 1 },
  },
];

// ── Action Nodes ─────────────────────────────────────────

const ACTION_NODES: NodeDefinition[] = [
  {
    type: 'action_update_field',
    label: 'Update Field',
    icon: 'edit',
    description: 'Update a field on the triggering record',
    category: 'action',
    color: COLORS.action,
    defaultConfig: { entity: '', field: '', value: '' },
    configFields: [
      {
        key: 'entity',
        label: 'Entity',
        type: 'select',
        required: true,
        options: [
          { label: 'Lead', value: 'lead' },
          { label: 'Contact', value: 'contact' },
          { label: 'Organization', value: 'organization' },
          { label: 'Quotation', value: 'quotation' },
          { label: 'Invoice', value: 'invoice' },
          { label: 'Task', value: 'task' },
        ],
      },
      { key: 'field', label: 'Field', type: 'entity-field', required: true },
      { key: 'value', label: 'New Value', type: 'text', required: true },
    ],
    handles: { inputs: 1, outputs: 1 },
  },
  {
    type: 'action_create_record',
    label: 'Create Record',
    icon: 'plus',
    description: 'Create a new record in an entity',
    category: 'action',
    color: COLORS.action,
    defaultConfig: { entity: '', data: {} },
    configFields: [
      {
        key: 'entity',
        label: 'Entity',
        type: 'select',
        required: true,
        options: [
          { label: 'Lead', value: 'lead' },
          { label: 'Contact', value: 'contact' },
          { label: 'Task', value: 'task' },
          { label: 'Activity', value: 'activity' },
        ],
      },
      {
        key: 'data',
        label: 'Record Data (JSON)',
        type: 'json',
        required: true,
        placeholder: '{ "name": "{{trigger.name}}" }',
      },
    ],
    handles: { inputs: 1, outputs: 1 },
  },
  {
    type: 'action_assign',
    label: 'Assign Owner',
    icon: 'user-check',
    description: 'Assign the record to a user or team',
    category: 'action',
    color: COLORS.action,
    defaultConfig: { assignmentType: 'user', userId: '', strategy: 'specific' },
    configFields: [
      {
        key: 'assignmentType',
        label: 'Assign To',
        type: 'select',
        required: true,
        options: [
          { label: 'Specific User', value: 'user' },
          { label: 'Round Robin', value: 'round_robin' },
          { label: 'Least Loaded', value: 'least_loaded' },
        ],
      },
      { key: 'userId', label: 'User', type: 'text', placeholder: 'User ID or name' },
    ],
    handles: { inputs: 1, outputs: 1 },
  },
  {
    type: 'action_move_stage',
    label: 'Move Stage',
    icon: 'arrow-right',
    description: 'Move a lead to a specific pipeline stage',
    category: 'action',
    color: COLORS.action,
    defaultConfig: { stageId: '' },
    configFields: [
      {
        key: 'stageId',
        label: 'Target Stage',
        type: 'select',
        required: true,
        options: [], // populated from pipeline stages at runtime
        placeholder: 'Select stage',
      },
    ],
    handles: { inputs: 1, outputs: 1 },
  },
  {
    type: 'action_send_email',
    label: 'Send Email',
    icon: 'mail',
    description: 'Send an email using a template',
    category: 'action',
    color: COLORS.action,
    defaultConfig: { templateId: '', to: '', subject: '', body: '' },
    configFields: [
      { key: 'to', label: 'To', type: 'text', required: true, placeholder: '{{contact.email}}' },
      { key: 'subject', label: 'Subject', type: 'text', required: true },
      { key: 'templateId', label: 'Template', type: 'select', options: [] },
      { key: 'body', label: 'Body', type: 'template' },
    ],
    handles: { inputs: 1, outputs: 1 },
  },
  {
    type: 'action_send_whatsapp',
    label: 'Send WhatsApp',
    icon: 'message-circle',
    description: 'Send a WhatsApp message to a contact',
    category: 'action',
    color: COLORS.action,
    defaultConfig: { templateId: '', to: '' },
    configFields: [
      { key: 'to', label: 'To', type: 'text', required: true, placeholder: '{{contact.phone}}' },
      { key: 'templateId', label: 'Template', type: 'select', options: [] },
    ],
    handles: { inputs: 1, outputs: 1 },
  },
  {
    type: 'action_send_notification',
    label: 'Send Notification',
    icon: 'bell',
    description: 'Send an in-app notification to a user',
    category: 'action',
    color: COLORS.action,
    defaultConfig: { userId: '', title: '', message: '' },
    configFields: [
      { key: 'userId', label: 'User', type: 'text', required: true },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'message', label: 'Message', type: 'template', required: true },
    ],
    handles: { inputs: 1, outputs: 1 },
  },
  {
    type: 'action_create_task',
    label: 'Create Task',
    icon: 'check-square',
    description: 'Create a follow-up task',
    category: 'action',
    color: COLORS.action,
    defaultConfig: { title: '', assigneeId: '', dueInDays: 1, priority: 'medium' },
    configFields: [
      { key: 'title', label: 'Task Title', type: 'text', required: true },
      { key: 'assigneeId', label: 'Assignee', type: 'text' },
      { key: 'dueInDays', label: 'Due In (days)', type: 'number', defaultValue: 1 },
      {
        key: 'priority',
        label: 'Priority',
        type: 'select',
        options: [
          { label: 'Low', value: 'low' },
          { label: 'Medium', value: 'medium' },
          { label: 'High', value: 'high' },
          { label: 'Urgent', value: 'urgent' },
        ],
      },
    ],
    handles: { inputs: 1, outputs: 1 },
  },
  {
    type: 'action_create_activity',
    label: 'Log Activity',
    icon: 'activity',
    description: 'Log an activity against the record',
    category: 'action',
    color: COLORS.action,
    defaultConfig: { type: 'note', subject: '', description: '' },
    configFields: [
      {
        key: 'type',
        label: 'Activity Type',
        type: 'select',
        required: true,
        options: [
          { label: 'Note', value: 'note' },
          { label: 'Call', value: 'call' },
          { label: 'Meeting', value: 'meeting' },
          { label: 'Email', value: 'email' },
        ],
      },
      { key: 'subject', label: 'Subject', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'template' },
    ],
    handles: { inputs: 1, outputs: 1 },
  },
  {
    type: 'action_http_request',
    label: 'HTTP Request',
    icon: 'globe',
    description: 'Make an outbound HTTP request to an external API',
    category: 'action',
    color: COLORS.action,
    defaultConfig: { method: 'POST', url: '', headers: {}, body: '' },
    configFields: [
      {
        key: 'method',
        label: 'Method',
        type: 'select',
        required: true,
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
          { label: 'PATCH', value: 'PATCH' },
          { label: 'DELETE', value: 'DELETE' },
        ],
      },
      { key: 'url', label: 'URL', type: 'text', required: true, placeholder: 'https://...' },
      { key: 'headers', label: 'Headers (JSON)', type: 'json' },
      { key: 'body', label: 'Body (JSON)', type: 'json' },
    ],
    handles: { inputs: 1, outputs: 1 },
  },
];

// ── Flow Control Nodes ───────────────────────────────────

const FLOW_NODES: NodeDefinition[] = [
  {
    type: 'flow_delay',
    label: 'Delay',
    icon: 'timer',
    description: 'Wait for a specified duration before continuing',
    category: 'flow',
    color: COLORS.flow,
    defaultConfig: { delayValue: 1, delayUnit: 'hours' },
    configFields: [
      { key: 'delayValue', label: 'Duration', type: 'number', required: true, defaultValue: 1 },
      {
        key: 'delayUnit',
        label: 'Unit',
        type: 'select',
        required: true,
        options: [
          { label: 'Minutes', value: 'minutes' },
          { label: 'Hours', value: 'hours' },
          { label: 'Days', value: 'days' },
        ],
      },
    ],
    handles: { inputs: 1, outputs: 1 },
  },
  {
    type: 'flow_loop',
    label: 'Loop',
    icon: 'repeat',
    description: 'Iterate over a list of items',
    category: 'flow',
    color: COLORS.flow,
    defaultConfig: { listField: '', maxIterations: 100 },
    configFields: [
      {
        key: 'listField',
        label: 'List Field',
        type: 'entity-field',
        required: true,
        placeholder: 'e.g. contacts',
      },
      { key: 'maxIterations', label: 'Max Iterations', type: 'number', defaultValue: 100 },
    ],
    handles: { inputs: 1, outputs: ['loop-body', 'done'] },
  },
  {
    type: 'flow_split',
    label: 'Parallel Split',
    icon: 'share-2',
    description: 'Execute multiple branches in parallel',
    category: 'flow',
    color: COLORS.flow,
    defaultConfig: {},
    handles: { inputs: 1, outputs: 2 },
  },
  {
    type: 'flow_merge',
    label: 'Merge',
    icon: 'git-commit',
    description: 'Wait for all incoming branches to complete, then continue',
    category: 'flow',
    color: COLORS.flow,
    defaultConfig: { waitForAll: true },
    configFields: [
      { key: 'waitForAll', label: 'Wait for all branches', type: 'boolean', defaultValue: true },
    ],
    handles: { inputs: 2, outputs: 1 },
  },
  {
    type: 'flow_end',
    label: 'End',
    icon: 'square',
    description: 'Mark the end of a workflow branch',
    category: 'flow',
    color: COLORS.flow,
    defaultConfig: {},
    handles: { inputs: 1, outputs: 0 },
  },
];

// ── Utility Nodes ────────────────────────────────────────

const UTILITY_NODES: NodeDefinition[] = [
  {
    type: 'util_note',
    label: 'Note',
    icon: 'sticky-note',
    description: 'Add a text note to the canvas (does not affect execution)',
    category: 'utility',
    color: COLORS.utility,
    defaultConfig: { text: '' },
    configFields: [
      { key: 'text', label: 'Note Text', type: 'text', placeholder: 'Add a note...' },
    ],
    handles: { inputs: 0, outputs: 0 },
  },
  {
    type: 'util_set_variable',
    label: 'Set Variable',
    icon: 'code',
    description: 'Set a workflow variable for use in later nodes',
    category: 'utility',
    color: COLORS.utility,
    defaultConfig: { variableName: '', value: '' },
    configFields: [
      { key: 'variableName', label: 'Variable Name', type: 'text', required: true },
      { key: 'value', label: 'Value', type: 'text', required: true },
    ],
    handles: { inputs: 1, outputs: 1 },
  },
  {
    type: 'util_format',
    label: 'Format Data',
    icon: 'type',
    description: 'Transform or format data between nodes',
    category: 'utility',
    color: COLORS.utility,
    defaultConfig: { template: '' },
    configFields: [
      {
        key: 'template',
        label: 'Template',
        type: 'template',
        required: true,
        placeholder: 'Hello {{contact.firstName}}, ...',
      },
    ],
    handles: { inputs: 1, outputs: 1 },
  },
];

// ── Exported Categories ──────────────────────────────────

export const NODE_CATEGORIES: NodeCategory[] = [
  {
    label: 'Triggers',
    icon: 'zap',
    color: COLORS.trigger,
    nodes: TRIGGER_NODES,
  },
  {
    label: 'Conditions',
    icon: 'git-branch',
    color: COLORS.condition,
    nodes: CONDITION_NODES,
  },
  {
    label: 'Actions',
    icon: 'play',
    color: COLORS.action,
    nodes: ACTION_NODES,
  },
  {
    label: 'Flow Control',
    icon: 'share-2',
    color: COLORS.flow,
    nodes: FLOW_NODES,
  },
  {
    label: 'Utilities',
    icon: 'tool',
    color: COLORS.utility,
    nodes: UTILITY_NODES,
  },
];

// ── Flat lookup helpers ──────────────────────────────────

const ALL_NODES: NodeDefinition[] = [
  ...TRIGGER_NODES,
  ...CONDITION_NODES,
  ...ACTION_NODES,
  ...FLOW_NODES,
  ...UTILITY_NODES,
];

export function getNodeDefinition(type: string): NodeDefinition | undefined {
  return ALL_NODES.find((n) => n.type === type);
}

export function getNodesByCategory(
  category: 'trigger' | 'condition' | 'action' | 'flow' | 'utility',
): NodeDefinition[] {
  return ALL_NODES.filter((n) => n.category === category);
}

/** @deprecated Use getNodeDefinition instead */
export function findNodeDefinition(nodeType: string) {
  return getNodeDefinition(nodeType);
}

/** @deprecated Use NODE_CATEGORIES.flatMap(c => c.nodes) instead */
export function getAllNodeDefinitions() {
  return ALL_NODES;
}
