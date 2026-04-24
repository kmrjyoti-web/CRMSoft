import type { TriggerEvent } from '../types/visual-workflow.types';

// ── CRM Trigger Events ──────────────────────────────────
// Every automation workflow starts with a trigger.
// These events map to backend domain events.

export const TRIGGER_EVENTS: TriggerEvent[] = [
  // ── Lead Events ──────────────────────────────────────
  { code: 'lead.created', label: 'Lead Created', entity: 'Lead', icon: 'plus' },
  { code: 'lead.updated', label: 'Lead Updated', entity: 'Lead', icon: 'edit' },
  {
    code: 'lead.stage_changed',
    label: 'Lead Stage Changed',
    entity: 'Lead',
    icon: 'git-branch',
  },
  { code: 'lead.assigned', label: 'Lead Assigned', entity: 'Lead', icon: 'user-check' },
  { code: 'lead.converted', label: 'Lead Converted', entity: 'Lead', icon: 'check-circle' },
  { code: 'lead.lost', label: 'Lead Lost', entity: 'Lead', icon: 'x-circle' },

  // ── Contact Events ───────────────────────────────────
  { code: 'contact.created', label: 'Contact Created', entity: 'Contact', icon: 'user-plus' },
  { code: 'contact.updated', label: 'Contact Updated', entity: 'Contact', icon: 'edit' },

  // ── Quotation Events ─────────────────────────────────
  {
    code: 'quotation.created',
    label: 'Quotation Created',
    entity: 'Quotation',
    icon: 'file-text',
  },
  {
    code: 'quotation.approved',
    label: 'Quotation Approved',
    entity: 'Quotation',
    icon: 'check-circle',
  },
  {
    code: 'quotation.rejected',
    label: 'Quotation Rejected',
    entity: 'Quotation',
    icon: 'x-circle',
  },

  // ── Invoice & Payment Events ─────────────────────────
  {
    code: 'invoice.created',
    label: 'Invoice Created',
    entity: 'Invoice',
    icon: 'file-text',
  },
  {
    code: 'payment.received',
    label: 'Payment Received',
    entity: 'Payment',
    icon: 'indian-rupee',
  },
  {
    code: 'payment.overdue',
    label: 'Payment Overdue',
    entity: 'Payment',
    icon: 'alert-triangle',
  },

  // ── Task Events ──────────────────────────────────────
  { code: 'task.created', label: 'Task Created', entity: 'Task', icon: 'check-square' },
  { code: 'task.completed', label: 'Task Completed', entity: 'Task', icon: 'check-circle' },
  { code: 'task.overdue', label: 'Task Overdue', entity: 'Task', icon: 'alert-circle' },

  // ── Activity Events ──────────────────────────────────
  {
    code: 'activity.logged',
    label: 'Activity Logged',
    entity: 'Activity',
    icon: 'activity',
  },

  // ── Schedule Events ──────────────────────────────────
  { code: 'schedule.daily', label: 'Daily Schedule', entity: null, icon: 'calendar' },
  { code: 'schedule.weekly', label: 'Weekly Schedule', entity: null, icon: 'calendar' },
  { code: 'schedule.monthly', label: 'Monthly Schedule', entity: null, icon: 'calendar' },
  { code: 'schedule.custom', label: 'Custom Cron', entity: null, icon: 'clock' },
];

// ── Helpers ──────────────────────────────────────────────

export function getTriggerEventByCode(code: string): TriggerEvent | undefined {
  return TRIGGER_EVENTS.find((e) => e.code === code);
}

export function getTriggerEventsByEntity(entity: string): TriggerEvent[] {
  return TRIGGER_EVENTS.filter((e) => e.entity === entity);
}

export function getScheduleEvents(): TriggerEvent[] {
  return TRIGGER_EVENTS.filter((e) => e.code.startsWith('schedule.'));
}
