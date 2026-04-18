"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowAiService = void 0;
const common_1 = require("@nestjs/common");
const COLORS = {
    trigger: '#22C55E',
    condition: '#EAB308',
    action: '#3B82F6',
    flow: '#A855F7',
    utility: '#6B7280',
};
const TRIGGER_PATTERNS = [
    {
        keywords: ['new lead', 'lead is created', 'lead created', 'create lead', 'lead comes in'],
        template: {
            nodeSubType: 'trigger_event',
            nodeCategory: 'trigger',
            label: 'Lead Created',
            icon: 'target',
            config: { entity: 'lead', event: 'created' },
        },
    },
    {
        keywords: ['new contact', 'contact is created', 'contact created', 'create contact'],
        template: {
            nodeSubType: 'trigger_event',
            nodeCategory: 'trigger',
            label: 'Contact Created',
            icon: 'user',
            config: { entity: 'contact', event: 'created' },
        },
    },
    {
        keywords: ['invoice created', 'new invoice', 'invoice is created', 'create invoice', 'invoice generation'],
        template: {
            nodeSubType: 'trigger_event',
            nodeCategory: 'trigger',
            label: 'Invoice Created',
            icon: 'file-text',
            config: { entity: 'invoice', event: 'created' },
        },
    },
    {
        keywords: ['task created', 'new task', 'task is created'],
        template: {
            nodeSubType: 'trigger_event',
            nodeCategory: 'trigger',
            label: 'Task Created',
            icon: 'check-square',
            config: { entity: 'task', event: 'created' },
        },
    },
    {
        keywords: ['lead updated', 'lead changes', 'lead is updated', 'lead moves', 'lead reaches', 'stage changes', 'won stage', 'lead stage'],
        template: {
            nodeSubType: 'trigger_event',
            nodeCategory: 'trigger',
            label: 'Lead Updated',
            icon: 'target',
            config: { entity: 'lead', event: 'updated' },
        },
    },
    {
        keywords: ['every day', 'daily', 'every morning', 'scheduled', 'every hour', 'cron', 'recurring'],
        template: {
            nodeSubType: 'trigger_schedule',
            nodeCategory: 'trigger',
            label: 'Scheduled Trigger',
            icon: 'clock',
            config: { schedule: 'daily' },
        },
    },
    {
        keywords: ['manually', 'manual trigger', 'on demand'],
        template: {
            nodeSubType: 'trigger_manual',
            nodeCategory: 'trigger',
            label: 'Manual Trigger',
            icon: 'mouse-pointer',
            config: {},
        },
    },
    {
        keywords: ['payment received', 'payment made', 'payment comes'],
        template: {
            nodeSubType: 'trigger_event',
            nodeCategory: 'trigger',
            label: 'Payment Received',
            icon: 'dollar-sign',
            config: { entity: 'payment', event: 'created' },
        },
    },
    {
        keywords: ['ticket created', 'new ticket', 'support ticket'],
        template: {
            nodeSubType: 'trigger_event',
            nodeCategory: 'trigger',
            label: 'Ticket Created',
            icon: 'headphones',
            config: { entity: 'ticket', event: 'created' },
        },
    },
];
const CONDITION_PATTERNS = [
    {
        keywords: ['if unpaid', 'is unpaid', 'not paid', 'payment pending', 'outstanding'],
        template: {
            nodeSubType: 'condition_if',
            nodeCategory: 'condition',
            label: 'If Unpaid',
            icon: 'git-branch',
            config: { field: 'paymentStatus', operator: 'equals', value: 'unpaid' },
        },
    },
    {
        keywords: ['if overdue', 'is overdue', 'past due'],
        template: {
            nodeSubType: 'condition_if',
            nodeCategory: 'condition',
            label: 'If Overdue',
            icon: 'git-branch',
            config: { field: 'dueDate', operator: 'less_than', value: 'now' },
        },
    },
    {
        keywords: ['if won', "reaches won", 'stage is won', "stage won"],
        template: {
            nodeSubType: 'condition_if',
            nodeCategory: 'condition',
            label: 'If Stage is Won',
            icon: 'git-branch',
            config: { field: 'stage', operator: 'equals', value: 'won' },
        },
    },
    {
        keywords: ['if lost', 'stage is lost', 'reaches lost'],
        template: {
            nodeSubType: 'condition_if',
            nodeCategory: 'condition',
            label: 'If Stage is Lost',
            icon: 'git-branch',
            config: { field: 'stage', operator: 'equals', value: 'lost' },
        },
    },
    {
        keywords: ['if high priority', 'priority is high', 'high-priority'],
        template: {
            nodeSubType: 'condition_if',
            nodeCategory: 'condition',
            label: 'If High Priority',
            icon: 'git-branch',
            config: { field: 'priority', operator: 'equals', value: 'high' },
        },
    },
    {
        keywords: ["haven't been contacted", 'not contacted', 'no contact', 'no response', 'uncontacted'],
        template: {
            nodeSubType: 'condition_if',
            nodeCategory: 'condition',
            label: 'If Not Contacted',
            icon: 'git-branch',
            config: { field: 'lastContactedAt', operator: 'is_null', value: true },
        },
    },
    {
        keywords: ['if open', 'is open', 'status open', 'still open'],
        template: {
            nodeSubType: 'condition_filter',
            nodeCategory: 'condition',
            label: 'Filter Open Items',
            icon: 'filter',
            config: { field: 'status', operator: 'equals', value: 'open' },
        },
    },
];
const ACTION_PATTERNS = [
    {
        keywords: ['send email', 'send an email', 'email notification', 'email it', 'email to', 'via email'],
        template: {
            nodeSubType: 'action_send_email',
            nodeCategory: 'action',
            label: 'Send Email',
            icon: 'mail',
            config: { channel: 'email' },
        },
    },
    {
        keywords: ['send whatsapp', 'whatsapp message', 'via whatsapp', 'whatsapp notification'],
        template: {
            nodeSubType: 'action_send_whatsapp',
            nodeCategory: 'action',
            label: 'Send WhatsApp',
            icon: 'message-circle',
            config: { channel: 'whatsapp' },
        },
    },
    {
        keywords: ['in-app notification', 'in-app', 'push notification', 'notify in app', 'app notification'],
        template: {
            nodeSubType: 'action_send_notification',
            nodeCategory: 'action',
            label: 'In-App Notification',
            icon: 'bell',
            config: { channel: 'in_app' },
        },
    },
    {
        keywords: ['notify', 'send notification', 'alert the team', 'notify the team', 'inform'],
        template: {
            nodeSubType: 'action_send_notification',
            nodeCategory: 'action',
            label: 'Send Notification',
            icon: 'bell',
            config: { channel: 'notification' },
        },
    },
    {
        keywords: ['create task', 'add task', 'generate task', 'make a task'],
        template: {
            nodeSubType: 'action_create_task',
            nodeCategory: 'action',
            label: 'Create Task',
            icon: 'check-square',
            config: { entity: 'task' },
        },
    },
    {
        keywords: ['assign to', 'assign it', 'auto-assign', 'assign lead', 'assign the'],
        template: {
            nodeSubType: 'action_assign',
            nodeCategory: 'action',
            label: 'Assign',
            icon: 'user-check',
            config: {},
        },
    },
    {
        keywords: ['move to stage', 'change stage', 'move stage', 'update stage', 'advance stage'],
        template: {
            nodeSubType: 'action_move_stage',
            nodeCategory: 'action',
            label: 'Move Stage',
            icon: 'arrow-right',
            config: {},
        },
    },
    {
        keywords: ['update field', 'set field', 'change field', 'modify field', 'mark as'],
        template: {
            nodeSubType: 'action_update_field',
            nodeCategory: 'action',
            label: 'Update Field',
            icon: 'edit',
            config: {},
        },
    },
    {
        keywords: ['create activity', 'log activity', 'add activity', 'record activity'],
        template: {
            nodeSubType: 'action_create_activity',
            nodeCategory: 'action',
            label: 'Create Activity',
            icon: 'activity',
            config: { entity: 'activity' },
        },
    },
    {
        keywords: ['http request', 'api call', 'webhook', 'call api', 'external api'],
        template: {
            nodeSubType: 'action_http_request',
            nodeCategory: 'action',
            label: 'HTTP Request',
            icon: 'globe',
            config: { method: 'POST' },
        },
    },
    {
        keywords: ['send reminder', 'payment reminder', 'follow-up reminder', 'remind'],
        template: {
            nodeSubType: 'action_send_email',
            nodeCategory: 'action',
            label: 'Send Reminder',
            icon: 'mail',
            config: { channel: 'email', template: 'reminder' },
        },
    },
    {
        keywords: ['welcome email', 'welcome message', 'onboarding email'],
        template: {
            nodeSubType: 'action_send_email',
            nodeCategory: 'action',
            label: 'Send Welcome Email',
            icon: 'mail',
            config: { channel: 'email', template: 'welcome' },
        },
    },
    {
        keywords: ['escalate', 'auto-escalate', 'escalation'],
        template: {
            nodeSubType: 'action_assign',
            nodeCategory: 'action',
            label: 'Escalate',
            icon: 'arrow-up-circle',
            config: { action: 'escalate' },
        },
    },
    {
        keywords: ['daily digest', 'digest', 'summary email', 'report email'],
        template: {
            nodeSubType: 'action_send_email',
            nodeCategory: 'action',
            label: 'Send Daily Digest',
            icon: 'mail',
            config: { channel: 'email', template: 'digest' },
        },
    },
];
const DELAY_PATTERNS = [
    {
        keywords: ['wait', 'delay', 'after'],
        template: {
            nodeSubType: 'flow_delay',
            nodeCategory: 'flow',
            label: 'Wait',
            icon: 'clock',
            config: {},
        },
        extractDelay: (text) => {
            const hourMatch = text.match(/(\d+)\s*hours?/i);
            const dayMatch = text.match(/(\d+)\s*days?/i);
            const minMatch = text.match(/(\d+)\s*minutes?/i);
            if (hourMatch)
                return { duration: parseInt(hourMatch[1], 10), unit: 'hours' };
            if (dayMatch)
                return { duration: parseInt(dayMatch[1], 10), unit: 'days' };
            if (minMatch)
                return { duration: parseInt(minMatch[1], 10), unit: 'minutes' };
            return { duration: 1, unit: 'hours' };
        },
    },
];
let WorkflowAiService = class WorkflowAiService {
    generateFromPrompt(prompt, _context) {
        const lower = prompt.toLowerCase();
        const triggers = this.matchPatterns(lower, TRIGGER_PATTERNS);
        const conditions = this.matchPatterns(lower, CONDITION_PATTERNS);
        const actions = this.matchActions(lower);
        const delays = this.matchDelays(lower);
        if (triggers.length === 0) {
            triggers.push({
                nodeSubType: 'trigger_event',
                nodeCategory: 'trigger',
                label: 'Event Trigger',
                icon: 'zap',
                config: { entity: 'record', event: 'created' },
            });
        }
        if (actions.length === 0) {
            actions.push({
                nodeSubType: 'action_send_notification',
                nodeCategory: 'action',
                label: 'Send Notification',
                icon: 'bell',
                config: { channel: 'notification' },
            });
        }
        const orderedTemplates = [
            ...triggers,
            ...delays,
            ...conditions,
            ...actions,
        ];
        orderedTemplates.push({
            nodeSubType: 'flow_end',
            nodeCategory: 'flow',
            label: 'End',
            icon: 'square',
            config: {},
        });
        const nodes = orderedTemplates.map((t, i) => ({
            id: `ai-node-${i + 1}`,
            type: t.nodeCategory === 'trigger' ? 'triggerNode' : t.nodeCategory === 'condition' ? 'conditionNode' : 'actionNode',
            position: { x: 100 + i * 250, y: 200 },
            data: {
                label: t.label,
                description: this.generateNodeDescription(t),
                nodeCategory: t.nodeCategory,
                nodeSubType: t.nodeSubType,
                icon: t.icon,
                color: COLORS[t.nodeCategory] ?? COLORS.utility,
                config: t.config,
                isConfigured: Object.keys(t.config).length > 0,
            },
        }));
        if (conditions.length > 0) {
            const condIdx = triggers.length + delays.length;
            for (let i = condIdx + 1; i < nodes.length - 1; i++) {
                nodes[i].position.y = 350;
            }
        }
        const edges = [];
        for (let i = 0; i < nodes.length - 1; i++) {
            const edge = {
                id: `ai-edge-${i + 1}`,
                source: nodes[i].id,
                target: nodes[i + 1].id,
                type: 'smoothstep',
                animated: nodes[i].data.nodeCategory === 'trigger',
            };
            if (nodes[i].data.nodeCategory === 'condition') {
                edge.label = 'Yes';
            }
            edges.push(edge);
        }
        const description = this.buildDescription(triggers, conditions, actions, delays);
        const suggestedName = this.buildSuggestedName(triggers, actions);
        return { nodes, edges, description, suggestedName };
    }
    matchPatterns(text, patterns) {
        const matched = [];
        const usedSubTypes = new Set();
        for (const pattern of patterns) {
            if (usedSubTypes.has(pattern.template.nodeSubType + pattern.template.label))
                continue;
            const hit = pattern.keywords.some((kw) => text.includes(kw));
            if (hit) {
                matched.push({ ...pattern.template });
                usedSubTypes.add(pattern.template.nodeSubType + pattern.template.label);
            }
        }
        return matched;
    }
    matchActions(text) {
        const matched = [];
        const usedLabels = new Set();
        for (const pattern of ACTION_PATTERNS) {
            if (usedLabels.has(pattern.template.label))
                continue;
            const hit = pattern.keywords.some((kw) => text.includes(kw));
            if (hit) {
                matched.push({ ...pattern.template });
                usedLabels.add(pattern.template.label);
            }
        }
        if (matched.length > 1) {
            const hasSpecific = matched.some((m) => m.nodeSubType === 'action_send_email' || m.nodeSubType === 'action_send_whatsapp');
            if (hasSpecific) {
                const idx = matched.findIndex((m) => m.label === 'Send Notification');
                if (idx >= 0)
                    matched.splice(idx, 1);
            }
        }
        return matched;
    }
    matchDelays(text) {
        const matched = [];
        for (const pattern of DELAY_PATTERNS) {
            const hit = pattern.keywords.some((kw) => text.includes(kw));
            if (hit) {
                const delay = pattern.extractDelay(text);
                matched.push({
                    ...pattern.template,
                    label: `Wait ${delay.duration} ${delay.unit}`,
                    config: delay,
                });
                break;
            }
        }
        return matched;
    }
    generateNodeDescription(template) {
        switch (template.nodeSubType) {
            case 'trigger_event':
                return `Triggers when ${template.config.entity ?? 'record'} is ${template.config.event ?? 'created'}`;
            case 'trigger_schedule':
                return `Runs on a ${template.config.schedule ?? 'daily'} schedule`;
            case 'trigger_manual':
                return 'Triggered manually by a user';
            case 'condition_if':
                return `Checks if ${template.config.field ?? 'field'} ${template.config.operator ?? 'equals'} ${template.config.value ?? 'value'}`;
            case 'condition_filter':
                return `Filters records where ${template.config.field ?? 'field'} ${template.config.operator ?? 'equals'} ${template.config.value ?? 'value'}`;
            case 'action_send_email':
                return `Sends an email${template.config.template ? ` (${template.config.template} template)` : ''}`;
            case 'action_send_whatsapp':
                return 'Sends a WhatsApp message';
            case 'action_send_notification':
                return 'Sends an in-app notification';
            case 'action_create_task':
                return 'Creates a new task';
            case 'action_assign':
                return template.config.action === 'escalate' ? 'Escalates the record' : 'Assigns the record';
            case 'action_move_stage':
                return 'Moves the record to a new stage';
            case 'action_update_field':
                return 'Updates a field on the record';
            case 'action_create_activity':
                return 'Creates an activity log entry';
            case 'action_http_request':
                return 'Makes an external HTTP request';
            case 'flow_delay':
                return `Waits for ${template.config.duration ?? 1} ${template.config.unit ?? 'hours'}`;
            case 'flow_end':
                return 'End of workflow';
            default:
                return '';
        }
    }
    buildDescription(triggers, conditions, actions, delays) {
        const parts = [];
        if (triggers.length > 0) {
            const triggerNames = triggers.map((t) => t.label).join(' or ');
            parts.push(`Workflow starts when: ${triggerNames}.`);
        }
        if (delays.length > 0) {
            parts.push(`Then waits: ${delays.map((d) => d.label).join(', ')}.`);
        }
        if (conditions.length > 0) {
            parts.push(`Checks: ${conditions.map((c) => c.label).join(', ')}.`);
        }
        if (actions.length > 0) {
            const actionNames = actions.map((a) => a.label).join(', ');
            parts.push(`Actions: ${actionNames}.`);
        }
        return parts.join(' ');
    }
    buildSuggestedName(triggers, actions) {
        const trigger = triggers[0]?.label ?? 'Event';
        const action = actions[0]?.label ?? 'Action';
        return `${trigger} → ${action}`;
    }
};
exports.WorkflowAiService = WorkflowAiService;
exports.WorkflowAiService = WorkflowAiService = __decorate([
    (0, common_1.Injectable)()
], WorkflowAiService);
//# sourceMappingURL=workflow-ai.service.js.map