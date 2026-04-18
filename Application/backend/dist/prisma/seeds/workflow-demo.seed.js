"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDemoWorkflow = seedDemoWorkflow;
async function seedDemoWorkflow(prisma, adminId, tenantId) {
    const workflow = await prisma.workflow.upsert({
        where: { tenantId_code: { tenantId, code: 'DEMO_PIPELINE_V1' } },
        update: {},
        create: {
            tenantId,
            name: 'Demo Pipeline',
            code: 'DEMO_PIPELINE_V1',
            entityType: 'DEMO',
            description: 'Default CRM demo scheduling workflow',
            isDefault: true,
            version: 1,
            createdById: adminId,
        },
    });
    const states = [
        { name: 'Scheduled', code: 'SCHEDULED', stateType: 'INITIAL', color: '#60A5FA', sortOrder: 0 },
        { name: 'Rescheduled', code: 'RESCHEDULED', stateType: 'INTERMEDIATE', color: '#F59E0B', sortOrder: 1 },
        { name: 'Completed', code: 'COMPLETED', stateType: 'TERMINAL', category: 'SUCCESS', color: '#10B981', sortOrder: 2 },
        { name: 'Cancelled', code: 'CANCELLED', stateType: 'TERMINAL', category: 'FAILURE', color: '#EF4444', sortOrder: 3 },
        { name: 'No Show', code: 'NO_SHOW', stateType: 'TERMINAL', category: 'FAILURE', color: '#9CA3AF', sortOrder: 4 },
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
        { from: 'SCHEDULED', to: 'RESCHEDULED', code: 'RESCHEDULE', name: 'Reschedule Demo' },
        { from: 'SCHEDULED', to: 'COMPLETED', code: 'COMPLETE_SCHEDULED', name: 'Mark Completed' },
        { from: 'SCHEDULED', to: 'CANCELLED', code: 'CANCEL_SCHEDULED', name: 'Cancel Demo' },
        { from: 'SCHEDULED', to: 'NO_SHOW', code: 'NO_SHOW_SCHEDULED', name: 'Mark No Show' },
        { from: 'RESCHEDULED', to: 'COMPLETED', code: 'COMPLETE_RESCHEDULED', name: 'Mark Completed' },
        { from: 'RESCHEDULED', to: 'CANCELLED', code: 'CANCEL_RESCHEDULED', name: 'Cancel Demo' },
        { from: 'RESCHEDULED', to: 'NO_SHOW', code: 'NO_SHOW_RESCHEDULED', name: 'Mark No Show' },
        { from: 'RESCHEDULED', to: 'RESCHEDULED', code: 'RESCHEDULE_AGAIN', name: 'Reschedule Again' },
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
            },
        });
    }
    console.log(`  ✓ Demo Pipeline workflow: ${states.length} states, ${transitions.length} transitions`);
}
//# sourceMappingURL=workflow-demo.seed.js.map