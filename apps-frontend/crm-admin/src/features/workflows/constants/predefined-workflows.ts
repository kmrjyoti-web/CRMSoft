// ═══════════════════════════════════════════════════════════
// PREDEFINED WORKFLOW TEMPLATES
// ═══════════════════════════════════════════════════════════
// 15 ready-to-use automation templates for the visual
// workflow builder. Each template includes pre-wired
// nodes and edges that users can customise after importing.
// ═══════════════════════════════════════════════════════════

import type { BaseNodeData } from '../types/visual-workflow.types';

// ── Types ─────────────────────────────────────────────────

export type TemplateCategory =
  | 'lead-management'
  | 'communication'
  | 'task-automation'
  | 'data-management'
  | 'integration';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  icon: string;
  tags: string[];
  nodes: any[];
  edges: any[];
}

// ── Color Palette (mirrors node-definitions.ts) ──────────

const C = {
  trigger: '#22C55E',
  condition: '#EAB308',
  action: '#3B82F6',
  flow: '#A855F7',
  utility: '#6B7280',
} as const;

// ── Helpers ───────────────────────────────────────────────

let _uid = 0;
function uid(prefix = 'tpl'): string {
  _uid += 1;
  return `${prefix}_${_uid}`;
}

function resetUid(): void {
  _uid = 0;
}

function pos(x: number, y: number): { x: number; y: number } {
  return { x, y };
}

function node(
  id: string,
  type: string,
  label: string,
  nodeCategory: BaseNodeData['nodeCategory'],
  nodeSubType: string,
  icon: string,
  color: string,
  position: { x: number; y: number },
  config: Record<string, unknown> = {},
  description = '',
): any {
  return {
    id,
    type,
    position,
    data: {
      label,
      description,
      nodeCategory,
      nodeSubType,
      icon,
      color,
      config,
      isConfigured: Object.keys(config).length > 0,
    } satisfies BaseNodeData,
  };
}

function edge(
  id: string,
  source: string,
  target: string,
  label?: string,
  sourceHandle?: string,
): any {
  const e: any = { id, source, target, type: label ? 'conditional' : 'default' };
  if (label) e.label = label;
  if (sourceHandle) e.sourceHandle = sourceHandle;
  return e;
}

// ── 1. New Lead Auto-Assignment ──────────────────────────

function tplLeadAutoAssignment(): WorkflowTemplate {
  resetUid();
  const n1 = uid(); const n2 = uid(); const n3 = uid();
  const n4 = uid(); const n5 = uid(); const n6 = uid();

  return {
    id: 'tpl-lead-auto-assignment',
    name: 'New Lead Auto-Assignment',
    description: 'Automatically assign new leads based on source. Website leads use round-robin; others go to a specific user.',
    category: 'lead-management',
    icon: 'user-plus',
    tags: ['lead', 'assignment', 'round-robin', 'automation'],
    nodes: [
      node(n1, 'trigger_event', 'Lead Created', 'trigger', 'trigger_event', 'zap', C.trigger, pos(0, 150), { eventCode: 'LEAD_CREATED' }),
      node(n2, 'condition_if', 'Source = Website?', 'condition', 'condition_if', 'git-branch', C.condition, pos(250, 150), { field: 'lead.source', operator: 'equals', value: 'website' }),
      node(n3, 'action_assign', 'Round Robin Assign', 'action', 'action_assign', 'user-check', C.action, pos(500, 50), { assignmentType: 'round_robin' }),
      node(n4, 'action_assign', 'Assign Specific User', 'action', 'action_assign', 'user-check', C.action, pos(500, 250), { assignmentType: 'user', userId: '' }),
      node(n5, 'action_send_notification', 'Notify Assignee', 'action', 'action_send_notification', 'bell', C.action, pos(750, 150), { title: 'New Lead Assigned', message: 'You have been assigned a new lead: {{lead.name}}' }),
      node(n6, 'flow_end', 'End', 'flow', 'flow_end', 'square', C.flow, pos(1000, 150)),
    ],
    edges: [
      edge(uid('e'), n1, n2),
      edge(uid('e'), n2, n3, 'Yes', 'yes'),
      edge(uid('e'), n2, n4, 'No', 'no'),
      edge(uid('e'), n3, n5),
      edge(uid('e'), n4, n5),
      edge(uid('e'), n5, n6),
    ],
  };
}

// ── 2. Lead Follow-Up Reminder ───────────────────────────

function tplLeadFollowUp(): WorkflowTemplate {
  resetUid();
  const n1 = uid(); const n2 = uid(); const n3 = uid();
  const n4 = uid(); const n5 = uid();

  return {
    id: 'tpl-lead-follow-up-reminder',
    name: 'Lead Follow-Up Reminder',
    description: 'After a lead is created, wait 2 days then create a follow-up task if the lead has not converted.',
    category: 'lead-management',
    icon: 'clock',
    tags: ['lead', 'follow-up', 'reminder', 'task'],
    nodes: [
      node(n1, 'trigger_event', 'Lead Created', 'trigger', 'trigger_event', 'zap', C.trigger, pos(0, 150), { eventCode: 'LEAD_CREATED' }),
      node(n2, 'flow_delay', 'Wait 2 Days', 'flow', 'flow_delay', 'timer', C.flow, pos(250, 150), { delayValue: 2, delayUnit: 'days' }),
      node(n3, 'condition_if', 'Not Converted?', 'condition', 'condition_if', 'git-branch', C.condition, pos(500, 150), { field: 'lead.status', operator: 'not_equals', value: 'converted' }),
      node(n4, 'action_create_task', 'Create Follow-Up Task', 'action', 'action_create_task', 'check-square', C.action, pos(750, 50), { title: 'Follow up on lead: {{lead.name}}', dueInDays: 1, priority: 'medium' }),
      node(n5, 'flow_end', 'End', 'flow', 'flow_end', 'square', C.flow, pos(1000, 150)),
    ],
    edges: [
      edge(uid('e'), n1, n2),
      edge(uid('e'), n2, n3),
      edge(uid('e'), n3, n4, 'Yes', 'yes'),
      edge(uid('e'), n3, n5, 'No', 'no'),
      edge(uid('e'), n4, n5),
    ],
  };
}

// ── 3. Hot Lead Alert ────────────────────────────────────

function tplHotLeadAlert(): WorkflowTemplate {
  resetUid();
  const n1 = uid(); const n2 = uid(); const n3 = uid();
  const n4 = uid(); const n5 = uid();

  return {
    id: 'tpl-hot-lead-alert',
    name: 'Hot Lead Alert',
    description: 'When a lead changes stage, alert the team via email and notification if the deal value exceeds 1,00,000.',
    category: 'lead-management',
    icon: 'flame',
    tags: ['lead', 'alert', 'high-value', 'notification'],
    nodes: [
      node(n1, 'trigger_event', 'Stage Changed', 'trigger', 'trigger_event', 'zap', C.trigger, pos(0, 150), { eventCode: 'LEAD_STAGE_CHANGED' }),
      node(n2, 'condition_if', 'Value > 1,00,000?', 'condition', 'condition_if', 'git-branch', C.condition, pos(250, 150), { field: 'lead.value', operator: 'greater_than', value: '100000' }),
      node(n3, 'action_send_email', 'Email Alert', 'action', 'action_send_email', 'mail', C.action, pos(500, 50), { subject: 'Hot Lead Alert: {{lead.name}}', to: '{{owner.email}}', body: 'Lead {{lead.name}} worth {{lead.value}} has moved to {{lead.stage}}.' }),
      node(n4, 'action_send_notification', 'In-App Alert', 'action', 'action_send_notification', 'bell', C.action, pos(500, 250), { title: 'Hot Lead!', message: '{{lead.name}} - {{lead.value}}' }),
      node(n5, 'flow_end', 'End', 'flow', 'flow_end', 'square', C.flow, pos(750, 150)),
    ],
    edges: [
      edge(uid('e'), n1, n2),
      edge(uid('e'), n2, n3, 'Yes', 'yes'),
      edge(uid('e'), n2, n5, 'No', 'no'),
      edge(uid('e'), n3, n4),
      edge(uid('e'), n4, n5),
    ],
  };
}

// ── 4. Welcome Email Sequence ────────────────────────────

function tplWelcomeEmailSequence(): WorkflowTemplate {
  resetUid();
  const n1 = uid(); const n2 = uid(); const n3 = uid();
  const n4 = uid(); const n5 = uid(); const n6 = uid();
  const n7 = uid();

  return {
    id: 'tpl-welcome-email-sequence',
    name: 'Welcome Email Sequence',
    description: 'Send a 3-part drip email sequence to new contacts: welcome, intro, and feature highlight emails.',
    category: 'communication',
    icon: 'mail',
    tags: ['email', 'drip', 'onboarding', 'contact'],
    nodes: [
      node(n1, 'trigger_event', 'Contact Created', 'trigger', 'trigger_event', 'zap', C.trigger, pos(0, 150), { eventCode: 'CONTACT_CREATED' }),
      node(n2, 'action_send_email', 'Welcome Email', 'action', 'action_send_email', 'mail', C.action, pos(250, 150), { subject: 'Welcome to {{company.name}}!', to: '{{contact.email}}', body: 'Hi {{contact.firstName}}, welcome aboard!' }),
      node(n3, 'flow_delay', 'Wait 1 Day', 'flow', 'flow_delay', 'timer', C.flow, pos(500, 150), { delayValue: 1, delayUnit: 'days' }),
      node(n4, 'action_send_email', 'Intro Email', 'action', 'action_send_email', 'mail', C.action, pos(750, 150), { subject: 'Getting Started Guide', to: '{{contact.email}}', body: 'Here is everything you need to get started.' }),
      node(n5, 'flow_delay', 'Wait 3 Days', 'flow', 'flow_delay', 'timer', C.flow, pos(1000, 150), { delayValue: 3, delayUnit: 'days' }),
      node(n6, 'action_send_email', 'Features Email', 'action', 'action_send_email', 'mail', C.action, pos(1250, 150), { subject: 'Discover Key Features', to: '{{contact.email}}', body: 'Check out these powerful features...' }),
      node(n7, 'flow_end', 'End', 'flow', 'flow_end', 'square', C.flow, pos(1500, 150)),
    ],
    edges: [
      edge(uid('e'), n1, n2),
      edge(uid('e'), n2, n3),
      edge(uid('e'), n3, n4),
      edge(uid('e'), n4, n5),
      edge(uid('e'), n5, n6),
      edge(uid('e'), n6, n7),
    ],
  };
}

// ── 5. WhatsApp Notification on Quotation ────────────────

function tplWhatsAppQuotation(): WorkflowTemplate {
  resetUid();
  const n1 = uid(); const n2 = uid(); const n3 = uid();
  const n4 = uid();

  return {
    id: 'tpl-whatsapp-quotation',
    name: 'WhatsApp Notification on Quotation',
    description: 'Send a WhatsApp message when a new quotation is created and log the activity.',
    category: 'communication',
    icon: 'message-circle',
    tags: ['whatsapp', 'quotation', 'notification'],
    nodes: [
      node(n1, 'trigger_event', 'Quotation Created', 'trigger', 'trigger_event', 'zap', C.trigger, pos(0, 150), { eventCode: 'QUOTATION_CREATED' }),
      node(n2, 'action_send_whatsapp', 'Send WhatsApp', 'action', 'action_send_whatsapp', 'message-circle', C.action, pos(250, 150), { to: '{{contact.phone}}', templateId: '' }),
      node(n3, 'action_create_activity', 'Log Activity', 'action', 'action_create_activity', 'activity', C.action, pos(500, 150), { type: 'note', subject: 'WhatsApp sent for quotation {{quotation.number}}' }),
      node(n4, 'flow_end', 'End', 'flow', 'flow_end', 'square', C.flow, pos(750, 150)),
    ],
    edges: [
      edge(uid('e'), n1, n2),
      edge(uid('e'), n2, n3),
      edge(uid('e'), n3, n4),
    ],
  };
}

// ── 6. Invoice Payment Reminder ──────────────────────────

function tplInvoicePaymentReminder(): WorkflowTemplate {
  resetUid();
  const n1 = uid(); const n2 = uid(); const n3 = uid();
  const n4 = uid(); const n5 = uid(); const n6 = uid();
  const n7 = uid();

  return {
    id: 'tpl-invoice-payment-reminder',
    name: 'Invoice Payment Reminder',
    description: 'After an invoice is created, send a payment reminder at 7 days and an overdue notice at 14 days if still unpaid.',
    category: 'communication',
    icon: 'credit-card',
    tags: ['invoice', 'payment', 'reminder', 'overdue'],
    nodes: [
      node(n1, 'trigger_event', 'Invoice Created', 'trigger', 'trigger_event', 'zap', C.trigger, pos(0, 150), { eventCode: 'INVOICE_CREATED' }),
      node(n2, 'flow_delay', 'Wait 7 Days', 'flow', 'flow_delay', 'timer', C.flow, pos(250, 150), { delayValue: 7, delayUnit: 'days' }),
      node(n3, 'condition_if', 'Still Unpaid?', 'condition', 'condition_if', 'git-branch', C.condition, pos(500, 150), { field: 'invoice.status', operator: 'not_equals', value: 'paid' }),
      node(n4, 'action_send_email', 'Payment Reminder', 'action', 'action_send_email', 'mail', C.action, pos(750, 50), { subject: 'Payment Reminder: Invoice #{{invoice.number}}', to: '{{contact.email}}', body: 'Your invoice is due. Please process the payment.' }),
      node(n5, 'flow_delay', 'Wait 7 More Days', 'flow', 'flow_delay', 'timer', C.flow, pos(1000, 50), { delayValue: 7, delayUnit: 'days' }),
      node(n6, 'action_send_email', 'Overdue Notice', 'action', 'action_send_email', 'mail', C.action, pos(1250, 50), { subject: 'Overdue: Invoice #{{invoice.number}}', to: '{{contact.email}}', body: 'This invoice is now overdue. Immediate payment is required.' }),
      node(n7, 'flow_end', 'End', 'flow', 'flow_end', 'square', C.flow, pos(1500, 150)),
    ],
    edges: [
      edge(uid('e'), n1, n2),
      edge(uid('e'), n2, n3),
      edge(uid('e'), n3, n4, 'Yes', 'yes'),
      edge(uid('e'), n3, n7, 'No', 'no'),
      edge(uid('e'), n4, n5),
      edge(uid('e'), n5, n6),
      edge(uid('e'), n6, n7),
    ],
  };
}

// ── 7. Daily Task Digest ─────────────────────────────────

function tplDailyTaskDigest(): WorkflowTemplate {
  resetUid();
  const n1 = uid(); const n2 = uid(); const n3 = uid();
  const n4 = uid();

  return {
    id: 'tpl-daily-task-digest',
    name: 'Daily Task Digest',
    description: 'Every morning at 9 AM, fetch today\'s tasks via API and email a summary digest.',
    category: 'task-automation',
    icon: 'list-checks',
    tags: ['task', 'digest', 'daily', 'schedule', 'email'],
    nodes: [
      node(n1, 'trigger_schedule', 'Daily 9 AM', 'trigger', 'trigger_schedule', 'clock', C.trigger, pos(0, 150), { scheduleType: 'daily', time: '09:00', cronExpression: '0 9 * * *' }),
      node(n2, 'action_http_request', 'Fetch Today Tasks', 'action', 'action_http_request', 'globe', C.action, pos(250, 150), { method: 'GET', url: '/api/v1/tasks?dueDate=today' }),
      node(n3, 'action_send_email', 'Send Digest Email', 'action', 'action_send_email', 'mail', C.action, pos(500, 150), { subject: 'Your Daily Task Digest', to: '{{currentUser.email}}', body: 'Here are your tasks for today: {{tasks}}' }),
      node(n4, 'flow_end', 'End', 'flow', 'flow_end', 'square', C.flow, pos(750, 150)),
    ],
    edges: [
      edge(uid('e'), n1, n2),
      edge(uid('e'), n2, n3),
      edge(uid('e'), n3, n4),
    ],
  };
}

// ── 8. Auto-Create Follow-Up Task ────────────────────────

function tplAutoFollowUpTask(): WorkflowTemplate {
  resetUid();
  const n1 = uid(); const n2 = uid(); const n3 = uid();
  const n4 = uid();

  return {
    id: 'tpl-auto-follow-up-task',
    name: 'Auto-Create Follow-Up Task',
    description: 'When a follow-up task is completed, automatically create the next follow-up task.',
    category: 'task-automation',
    icon: 'check-square',
    tags: ['task', 'follow-up', 'automation', 'recurring'],
    nodes: [
      node(n1, 'trigger_event', 'Task Completed', 'trigger', 'trigger_event', 'zap', C.trigger, pos(0, 150), { eventCode: 'TASK_COMPLETED' }),
      node(n2, 'condition_if', 'Is Follow-Up?', 'condition', 'condition_if', 'git-branch', C.condition, pos(250, 150), { field: 'task.type', operator: 'equals', value: 'follow_up' }),
      node(n3, 'action_create_task', 'Create Next Follow-Up', 'action', 'action_create_task', 'check-square', C.action, pos(500, 50), { title: 'Follow-up: {{task.relatedEntity}}', dueInDays: 3, priority: 'medium' }),
      node(n4, 'flow_end', 'End', 'flow', 'flow_end', 'square', C.flow, pos(750, 150)),
    ],
    edges: [
      edge(uid('e'), n1, n2),
      edge(uid('e'), n2, n3, 'Yes', 'yes'),
      edge(uid('e'), n2, n4, 'No', 'no'),
      edge(uid('e'), n3, n4),
    ],
  };
}

// ── 9. SLA Escalation ────────────────────────────────────

function tplSlaEscalation(): WorkflowTemplate {
  resetUid();
  const n1 = uid(); const n2 = uid(); const n3 = uid();
  const n4 = uid(); const n5 = uid(); const n6 = uid();

  return {
    id: 'tpl-sla-escalation',
    name: 'SLA Escalation',
    description: 'If a new lead is not actioned within 4 hours, escalate to the manager and send an SLA breach notification.',
    category: 'task-automation',
    icon: 'alert-triangle',
    tags: ['SLA', 'escalation', 'lead', 'manager', 'alert'],
    nodes: [
      node(n1, 'trigger_event', 'Lead Created', 'trigger', 'trigger_event', 'zap', C.trigger, pos(0, 150), { eventCode: 'LEAD_CREATED' }),
      node(n2, 'flow_delay', 'Wait 4 Hours', 'flow', 'flow_delay', 'timer', C.flow, pos(250, 150), { delayValue: 4, delayUnit: 'hours' }),
      node(n3, 'condition_if', 'Still New?', 'condition', 'condition_if', 'git-branch', C.condition, pos(500, 150), { field: 'lead.status', operator: 'equals', value: 'new' }),
      node(n4, 'action_assign', 'Escalate to Manager', 'action', 'action_assign', 'user-check', C.action, pos(750, 50), { assignmentType: 'user', userId: 'manager' }),
      node(n5, 'action_send_notification', 'SLA Breach Alert', 'action', 'action_send_notification', 'bell', C.action, pos(1000, 50), { title: 'SLA Breach', message: 'Lead {{lead.name}} has not been actioned in 4 hours.' }),
      node(n6, 'flow_end', 'End', 'flow', 'flow_end', 'square', C.flow, pos(1250, 150)),
    ],
    edges: [
      edge(uid('e'), n1, n2),
      edge(uid('e'), n2, n3),
      edge(uid('e'), n3, n4, 'Yes', 'yes'),
      edge(uid('e'), n3, n6, 'No', 'no'),
      edge(uid('e'), n4, n5),
      edge(uid('e'), n5, n6),
    ],
  };
}

// ── 10. Lead Scoring Update ──────────────────────────────

function tplLeadScoringUpdate(): WorkflowTemplate {
  resetUid();
  const n1 = uid(); const n2 = uid(); const n3 = uid();
  const n4 = uid();

  return {
    id: 'tpl-lead-scoring-update',
    name: 'Lead Scoring Update',
    description: 'When a lead stage changes, calculate a new score and update the lead record.',
    category: 'data-management',
    icon: 'bar-chart-2',
    tags: ['lead', 'scoring', 'update', 'data'],
    nodes: [
      node(n1, 'trigger_event', 'Stage Changed', 'trigger', 'trigger_event', 'zap', C.trigger, pos(0, 150), { eventCode: 'LEAD_STAGE_CHANGED' }),
      node(n2, 'util_set_variable', 'Calculate Score', 'utility', 'util_set_variable', 'code', C.utility, pos(250, 150), { variableName: 'score', value: '{{lead.stageWeight * 10}}' }),
      node(n3, 'action_update_field', 'Update Lead Score', 'action', 'action_update_field', 'edit', C.action, pos(500, 150), { entity: 'lead', field: 'score', value: '{{variables.score}}' }),
      node(n4, 'flow_end', 'End', 'flow', 'flow_end', 'square', C.flow, pos(750, 150)),
    ],
    edges: [
      edge(uid('e'), n1, n2),
      edge(uid('e'), n2, n3),
      edge(uid('e'), n3, n4),
    ],
  };
}

// ── 11. Contact Dedup Alert ──────────────────────────────

function tplContactDedupAlert(): WorkflowTemplate {
  resetUid();
  const n1 = uid(); const n2 = uid(); const n3 = uid();
  const n4 = uid(); const n5 = uid(); const n6 = uid();

  return {
    id: 'tpl-contact-dedup-alert',
    name: 'Contact Dedup Alert',
    description: 'When a contact is created with an email, check for duplicates and alert the user if a match is found.',
    category: 'data-management',
    icon: 'copy',
    tags: ['contact', 'duplicate', 'dedup', 'alert', 'data-quality'],
    nodes: [
      node(n1, 'trigger_event', 'Contact Created', 'trigger', 'trigger_event', 'zap', C.trigger, pos(0, 150), { eventCode: 'CONTACT_CREATED' }),
      node(n2, 'condition_filter', 'Has Email?', 'condition', 'condition_filter', 'filter', C.condition, pos(250, 150), { field: 'contact.email', operator: 'is_not_empty', value: '' }),
      node(n3, 'action_http_request', 'Check Duplicate', 'action', 'action_http_request', 'globe', C.action, pos(500, 150), { method: 'GET', url: '/api/v1/contacts?email={{contact.email}}&excludeId={{contact.id}}' }),
      node(n4, 'condition_if', 'Duplicate Found?', 'condition', 'condition_if', 'git-branch', C.condition, pos(750, 150), { field: 'response.count', operator: 'greater_than', value: '0' }),
      node(n5, 'action_send_notification', 'Duplicate Alert', 'action', 'action_send_notification', 'bell', C.action, pos(1000, 50), { title: 'Possible Duplicate Contact', message: '{{contact.name}} may be a duplicate. Email: {{contact.email}}' }),
      node(n6, 'flow_end', 'End', 'flow', 'flow_end', 'square', C.flow, pos(1250, 150)),
    ],
    edges: [
      edge(uid('e'), n1, n2),
      edge(uid('e'), n2, n3),
      edge(uid('e'), n3, n4),
      edge(uid('e'), n4, n5, 'Yes', 'yes'),
      edge(uid('e'), n4, n6, 'No', 'no'),
      edge(uid('e'), n5, n6),
    ],
  };
}

// ── 12. Organization Enrichment ──────────────────────────

function tplOrgEnrichment(): WorkflowTemplate {
  resetUid();
  const n1 = uid(); const n2 = uid(); const n3 = uid();
  const n4 = uid(); const n5 = uid();

  return {
    id: 'tpl-org-enrichment',
    name: 'Organization Enrichment',
    description: 'When a lead is created with an organization, enrich the organization data from an external API.',
    category: 'data-management',
    icon: 'building',
    tags: ['organization', 'enrichment', 'API', 'data'],
    nodes: [
      node(n1, 'trigger_event', 'Lead Created', 'trigger', 'trigger_event', 'zap', C.trigger, pos(0, 150), { eventCode: 'LEAD_CREATED' }),
      node(n2, 'condition_filter', 'Has Organization?', 'condition', 'condition_filter', 'filter', C.condition, pos(250, 150), { field: 'lead.organizationId', operator: 'is_not_empty', value: '' }),
      node(n3, 'action_http_request', 'Enrich Org Data', 'action', 'action_http_request', 'globe', C.action, pos(500, 150), { method: 'GET', url: 'https://api.enrichment.example/org?domain={{organization.website}}' }),
      node(n4, 'action_update_field', 'Update Industry', 'action', 'action_update_field', 'edit', C.action, pos(750, 150), { entity: 'organization', field: 'industry', value: '{{response.industry}}' }),
      node(n5, 'flow_end', 'End', 'flow', 'flow_end', 'square', C.flow, pos(1000, 150)),
    ],
    edges: [
      edge(uid('e'), n1, n2),
      edge(uid('e'), n2, n3),
      edge(uid('e'), n3, n4),
      edge(uid('e'), n4, n5),
    ],
  };
}

// ── 13. Webhook to CRM Sync ─────────────────────────────

function tplWebhookCrmSync(): WorkflowTemplate {
  resetUid();
  const n1 = uid(); const n2 = uid(); const n3 = uid();
  const n4 = uid(); const n5 = uid();

  return {
    id: 'tpl-webhook-crm-sync',
    name: 'Webhook to CRM Sync',
    description: 'Manually trigger an external data fetch, create a lead in the CRM, and notify the team.',
    category: 'integration',
    icon: 'refresh-cw',
    tags: ['webhook', 'sync', 'integration', 'external', 'lead'],
    nodes: [
      node(n1, 'trigger_manual', 'Manual Trigger', 'trigger', 'trigger_manual', 'play', C.trigger, pos(0, 150)),
      node(n2, 'action_http_request', 'Fetch External Data', 'action', 'action_http_request', 'globe', C.action, pos(250, 150), { method: 'GET', url: 'https://external-api.example/leads' }),
      node(n3, 'action_create_record', 'Create Lead', 'action', 'action_create_record', 'plus', C.action, pos(500, 150), { entity: 'lead', data: { name: '{{response.name}}', email: '{{response.email}}', source: 'external_sync' } }),
      node(n4, 'action_send_notification', 'Notify Team', 'action', 'action_send_notification', 'bell', C.action, pos(750, 150), { title: 'Sync Complete', message: 'New lead synced from external source: {{response.name}}' }),
      node(n5, 'flow_end', 'End', 'flow', 'flow_end', 'square', C.flow, pos(1000, 150)),
    ],
    edges: [
      edge(uid('e'), n1, n2),
      edge(uid('e'), n2, n3),
      edge(uid('e'), n3, n4),
      edge(uid('e'), n4, n5),
    ],
  };
}

// ── 14. Post-Payment Workflow ────────────────────────────

function tplPostPayment(): WorkflowTemplate {
  resetUid();
  const n1 = uid(); const n2 = uid(); const n3 = uid();
  const n4 = uid(); const n5 = uid();

  return {
    id: 'tpl-post-payment',
    name: 'Post-Payment Workflow',
    description: 'After a payment is received, mark the invoice as paid, send a receipt email, and log the activity.',
    category: 'integration',
    icon: 'indian-rupee',
    tags: ['payment', 'invoice', 'receipt', 'email', 'activity'],
    nodes: [
      node(n1, 'trigger_event', 'Payment Received', 'trigger', 'trigger_event', 'zap', C.trigger, pos(0, 150), { eventCode: 'PAYMENT_RECEIVED' }),
      node(n2, 'action_update_field', 'Mark Invoice Paid', 'action', 'action_update_field', 'edit', C.action, pos(250, 150), { entity: 'invoice', field: 'status', value: 'paid' }),
      node(n3, 'action_send_email', 'Send Receipt', 'action', 'action_send_email', 'mail', C.action, pos(500, 150), { subject: 'Payment Receipt for Invoice #{{invoice.number}}', to: '{{contact.email}}', body: 'Thank you for your payment of {{payment.amount}}.' }),
      node(n4, 'action_create_activity', 'Log Payment', 'action', 'action_create_activity', 'activity', C.action, pos(750, 150), { type: 'note', subject: 'Payment of {{payment.amount}} received for Invoice #{{invoice.number}}' }),
      node(n5, 'flow_end', 'End', 'flow', 'flow_end', 'square', C.flow, pos(1000, 150)),
    ],
    edges: [
      edge(uid('e'), n1, n2),
      edge(uid('e'), n2, n3),
      edge(uid('e'), n3, n4),
      edge(uid('e'), n4, n5),
    ],
  };
}

// ── 15. Multi-Channel Notification ───────────────────────

function tplMultiChannelNotification(): WorkflowTemplate {
  resetUid();
  const n1 = uid(); const n2 = uid(); const n3 = uid();
  const n4 = uid(); const n5 = uid(); const n6 = uid();
  const n7 = uid(); const n8 = uid(); const n9 = uid();

  return {
    id: 'tpl-multi-channel-notification',
    name: 'Multi-Channel Notification',
    description: 'When a lead is won, send parallel notifications via email, WhatsApp, and in-app, then log the activity.',
    category: 'communication',
    icon: 'megaphone',
    tags: ['multi-channel', 'notification', 'email', 'whatsapp', 'won'],
    nodes: [
      node(n1, 'trigger_event', 'Stage Changed', 'trigger', 'trigger_event', 'zap', C.trigger, pos(0, 150), { eventCode: 'LEAD_STAGE_CHANGED' }),
      node(n2, 'condition_if', 'Stage = Won?', 'condition', 'condition_if', 'git-branch', C.condition, pos(250, 150), { field: 'lead.stage', operator: 'equals', value: 'won' }),
      node(n3, 'flow_split', 'Parallel Split', 'flow', 'flow_split', 'share-2', C.flow, pos(500, 150)),
      node(n4, 'action_send_email', 'Congratulations Email', 'action', 'action_send_email', 'mail', C.action, pos(750, 0), { subject: 'Deal Won: {{lead.name}}', to: '{{owner.email}}', body: 'Congratulations on closing {{lead.name}}!' }),
      node(n5, 'action_send_whatsapp', 'WhatsApp Message', 'action', 'action_send_whatsapp', 'message-circle', C.action, pos(750, 150), { to: '{{owner.phone}}', templateId: '' }),
      node(n6, 'action_send_notification', 'In-App Notification', 'action', 'action_send_notification', 'bell', C.action, pos(750, 300), { title: 'Deal Won!', message: '{{lead.name}} has been won by {{owner.name}}.' }),
      node(n7, 'flow_merge', 'Merge', 'flow', 'flow_merge', 'git-commit', C.flow, pos(1000, 150), { waitForAll: true }),
      node(n8, 'action_create_activity', 'Log Notified', 'action', 'action_create_activity', 'activity', C.action, pos(1250, 150), { type: 'note', subject: 'Multi-channel notification sent for won deal: {{lead.name}}' }),
      node(n9, 'flow_end', 'End', 'flow', 'flow_end', 'square', C.flow, pos(1500, 150)),
    ],
    edges: [
      edge(uid('e'), n1, n2),
      edge(uid('e'), n2, n3, 'Yes', 'yes'),
      edge(uid('e'), n2, n9, 'No', 'no'),
      edge(uid('e'), n3, n4),
      edge(uid('e'), n3, n5),
      edge(uid('e'), n3, n6),
      edge(uid('e'), n4, n7),
      edge(uid('e'), n5, n7),
      edge(uid('e'), n6, n7),
      edge(uid('e'), n7, n8),
      edge(uid('e'), n8, n9),
    ],
  };
}

// ── Exported Template List ───────────────────────────────

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  tplLeadAutoAssignment(),
  tplLeadFollowUp(),
  tplHotLeadAlert(),
  tplWelcomeEmailSequence(),
  tplWhatsAppQuotation(),
  tplInvoicePaymentReminder(),
  tplDailyTaskDigest(),
  tplAutoFollowUpTask(),
  tplSlaEscalation(),
  tplLeadScoringUpdate(),
  tplContactDedupAlert(),
  tplOrgEnrichment(),
  tplWebhookCrmSync(),
  tplPostPayment(),
  tplMultiChannelNotification(),
];

// ── Lookup Helpers ───────────────────────────────────────

export function getTemplatesByCategory(category: string): WorkflowTemplate[] {
  return WORKFLOW_TEMPLATES.filter((t) => t.category === category);
}

export function getTemplateById(id: string): WorkflowTemplate | undefined {
  return WORKFLOW_TEMPLATES.find((t) => t.id === id);
}

export function getTemplateCategories(): { key: TemplateCategory; label: string; icon: string }[] {
  return [
    { key: 'lead-management', label: 'Lead Management', icon: 'user-plus' },
    { key: 'communication', label: 'Communication', icon: 'mail' },
    { key: 'task-automation', label: 'Task Automation', icon: 'check-square' },
    { key: 'data-management', label: 'Data Management', icon: 'database' },
    { key: 'integration', label: 'Integration', icon: 'plug' },
  ];
}
