"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedLeadWorkflow = seedLeadWorkflow;
async function seedLeadWorkflow(prisma, adminId, tenantId) {
    const workflow = await prisma.workflow.upsert({
        where: { tenantId_code: { tenantId, code: 'LEAD_PIPELINE_V1' } },
        update: {},
        create: {
            tenantId,
            name: 'Lead Pipeline',
            code: 'LEAD_PIPELINE_V1',
            entityType: 'LEAD',
            description: 'Default CRM lead pipeline workflow',
            isDefault: true,
            version: 1,
            createdById: adminId,
        },
    });
    const states = [
        { name: 'New', code: 'NEW', stateType: 'INITIAL', color: '#94A3B8', sortOrder: 0 },
        { name: 'Verified', code: 'VERIFIED', stateType: 'INTERMEDIATE', color: '#60A5FA', sortOrder: 1 },
        { name: 'Allocated', code: 'ALLOCATED', stateType: 'INTERMEDIATE', color: '#818CF8', sortOrder: 2 },
        { name: 'In Progress', code: 'IN_PROGRESS', stateType: 'INTERMEDIATE', color: '#34D399', sortOrder: 3 },
        { name: 'Demo Scheduled', code: 'DEMO_SCHEDULED', stateType: 'INTERMEDIATE', color: '#F59E0B', sortOrder: 4 },
        { name: 'Quotation Sent', code: 'QUOTATION_SENT', stateType: 'INTERMEDIATE', color: '#F97316', sortOrder: 5 },
        { name: 'Negotiation', code: 'NEGOTIATION', stateType: 'INTERMEDIATE', color: '#A78BFA', sortOrder: 6 },
        { name: 'Won', code: 'WON', stateType: 'TERMINAL', category: 'SUCCESS', color: '#10B981', sortOrder: 7 },
        { name: 'Lost', code: 'LOST', stateType: 'TERMINAL', category: 'FAILURE', color: '#EF4444', sortOrder: 8 },
        { name: 'On Hold', code: 'ON_HOLD', stateType: 'INTERMEDIATE', category: 'PAUSED', color: '#9CA3AF', sortOrder: 9 },
    ];
    const stateMap = {};
    for (const s of states) {
        const state = await prisma.workflowState.upsert({
            where: { tenantId_workflowId_code: { tenantId, workflowId: workflow.id, code: s.code } },
            update: {},
            create: { tenantId, workflowId: workflow.id, name: s.name, code: s.code, stateType: s.stateType, category: s.category, color: s.color, sortOrder: s.sortOrder },
        });
        stateMap[s.code] = state.id;
    }
    const transitions = [
        { from: 'NEW', to: 'VERIFIED', code: 'VERIFY', name: 'Verify Lead' },
        { from: 'NEW', to: 'LOST', code: 'NEW_TO_LOST', name: 'Mark Lost (New)' },
        { from: 'VERIFIED', to: 'ALLOCATED', code: 'ALLOCATE', name: 'Allocate to Sales' },
        { from: 'VERIFIED', to: 'LOST', code: 'VERIFIED_TO_LOST', name: 'Mark Lost (Verified)' },
        { from: 'ALLOCATED', to: 'IN_PROGRESS', code: 'START_PROGRESS', name: 'Start Working' },
        { from: 'ALLOCATED', to: 'LOST', code: 'ALLOCATED_TO_LOST', name: 'Mark Lost (Allocated)' },
        { from: 'ALLOCATED', to: 'ON_HOLD', code: 'ALLOCATED_TO_HOLD', name: 'Put On Hold' },
        { from: 'IN_PROGRESS', to: 'DEMO_SCHEDULED', code: 'SCHEDULE_DEMO', name: 'Schedule Demo' },
        { from: 'IN_PROGRESS', to: 'QUOTATION_SENT', code: 'SEND_QUOTATION_DIRECT', name: 'Send Quotation' },
        { from: 'IN_PROGRESS', to: 'LOST', code: 'PROGRESS_TO_LOST', name: 'Mark Lost (In Progress)' },
        { from: 'IN_PROGRESS', to: 'ON_HOLD', code: 'PROGRESS_TO_HOLD', name: 'Put On Hold' },
        { from: 'DEMO_SCHEDULED', to: 'IN_PROGRESS', code: 'BACK_TO_PROGRESS', name: 'Back to In Progress' },
        { from: 'DEMO_SCHEDULED', to: 'QUOTATION_SENT', code: 'SEND_QUOTATION_AFTER_DEMO', name: 'Send Quotation' },
        { from: 'DEMO_SCHEDULED', to: 'LOST', code: 'DEMO_TO_LOST', name: 'Mark Lost (Demo)' },
        { from: 'DEMO_SCHEDULED', to: 'ON_HOLD', code: 'DEMO_TO_HOLD', name: 'Put On Hold' },
        { from: 'QUOTATION_SENT', to: 'NEGOTIATION', code: 'START_NEGOTIATION', name: 'Start Negotiation' },
        { from: 'QUOTATION_SENT', to: 'WON', code: 'QUOTATION_TO_WON', name: 'Mark Won' },
        { from: 'QUOTATION_SENT', to: 'LOST', code: 'QUOTATION_TO_LOST', name: 'Mark Lost' },
        { from: 'QUOTATION_SENT', to: 'ON_HOLD', code: 'QUOTATION_TO_HOLD', name: 'Put On Hold' },
        { from: 'NEGOTIATION', to: 'WON', code: 'NEGOTIATION_TO_WON', name: 'Mark Won' },
        { from: 'NEGOTIATION', to: 'LOST', code: 'NEGOTIATION_TO_LOST', name: 'Mark Lost' },
        { from: 'NEGOTIATION', to: 'QUOTATION_SENT', code: 'REVISE_QUOTATION', name: 'Revise Quotation' },
        { from: 'NEGOTIATION', to: 'ON_HOLD', code: 'NEGOTIATION_TO_HOLD', name: 'Put On Hold' },
        { from: 'ON_HOLD', to: 'IN_PROGRESS', code: 'RESUME_PROGRESS', name: 'Resume Work' },
        { from: 'ON_HOLD', to: 'ALLOCATED', code: 'RESUME_ALLOCATED', name: 'Reallocate' },
        { from: 'ON_HOLD', to: 'LOST', code: 'HOLD_TO_LOST', name: 'Mark Lost (On Hold)' },
    ];
    for (const t of transitions) {
        await prisma.workflowTransition.upsert({
            where: { tenantId_workflowId_code: { tenantId, workflowId: workflow.id, code: t.code } },
            update: {},
            create: {
                tenantId,
                workflowId: workflow.id,
                fromStateId: stateMap[t.from],
                toStateId: stateMap[t.to],
                name: t.name,
                code: t.code,
                triggerType: 'MANUAL',
                actions: [{ type: 'FIELD_UPDATE', config: { entity: 'lead', field: 'status', value: t.to } }],
            },
        });
    }
    console.log(`  ✓ Lead Pipeline workflow: ${states.length} states, ${transitions.length} transitions`);
}
//# sourceMappingURL=workflow-lead-pipeline.seed.js.map