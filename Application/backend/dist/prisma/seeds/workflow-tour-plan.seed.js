"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedTourPlanWorkflow = seedTourPlanWorkflow;
async function seedTourPlanWorkflow(prisma, adminId, tenantId) {
    const workflow = await prisma.workflow.upsert({
        where: { tenantId_code: { tenantId, code: 'TOUR_PLAN_V1' } },
        update: {},
        create: {
            tenantId,
            name: 'Tour Plan Pipeline',
            code: 'TOUR_PLAN_V1',
            entityType: 'TOUR_PLAN',
            description: 'Default CRM tour plan approval workflow',
            isDefault: true,
            version: 1,
            createdById: adminId,
        },
    });
    const states = [
        { name: 'Draft', code: 'DRAFT', stateType: 'INITIAL', color: '#94A3B8', sortOrder: 0 },
        { name: 'Pending Approval', code: 'PENDING_APPROVAL', stateType: 'INTERMEDIATE', color: '#F59E0B', sortOrder: 1 },
        { name: 'Approved', code: 'APPROVED', stateType: 'INTERMEDIATE', category: 'SUCCESS', color: '#10B981', sortOrder: 2 },
        { name: 'Rejected', code: 'REJECTED', stateType: 'TERMINAL', category: 'FAILURE', color: '#EF4444', sortOrder: 3 },
        { name: 'In Progress', code: 'IN_PROGRESS', stateType: 'INTERMEDIATE', color: '#3B82F6', sortOrder: 4 },
        { name: 'Completed', code: 'COMPLETED', stateType: 'TERMINAL', category: 'SUCCESS', color: '#059669', sortOrder: 5 },
        { name: 'Cancelled', code: 'CANCELLED', stateType: 'TERMINAL', category: 'FAILURE', color: '#DC2626', sortOrder: 6 },
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
        { from: 'DRAFT', to: 'PENDING_APPROVAL', code: 'SUBMIT_FOR_APPROVAL', name: 'Submit for Approval' },
        { from: 'DRAFT', to: 'CANCELLED', code: 'CANCEL_DRAFT', name: 'Cancel Plan' },
        { from: 'PENDING_APPROVAL', to: 'APPROVED', code: 'APPROVE_PLAN', name: 'Approve Plan' },
        { from: 'PENDING_APPROVAL', to: 'REJECTED', code: 'REJECT_PLAN', name: 'Reject Plan' },
        { from: 'PENDING_APPROVAL', to: 'DRAFT', code: 'SEND_BACK_TO_DRAFT', name: 'Send Back to Draft' },
        { from: 'APPROVED', to: 'IN_PROGRESS', code: 'START_TOUR', name: 'Start Tour' },
        { from: 'APPROVED', to: 'CANCELLED', code: 'CANCEL_APPROVED', name: 'Cancel Plan' },
        { from: 'IN_PROGRESS', to: 'COMPLETED', code: 'COMPLETE_TOUR', name: 'Complete Tour' },
        { from: 'IN_PROGRESS', to: 'CANCELLED', code: 'CANCEL_IN_PROGRESS', name: 'Cancel Tour' },
        { from: 'REJECTED', to: 'DRAFT', code: 'REVISE_PLAN', name: 'Revise Plan' },
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
                triggerType: t.code === 'APPROVE_PLAN' || t.code === 'REJECT_PLAN' ? 'APPROVAL' : 'MANUAL',
            },
        });
    }
    console.log(`  ✓ Tour Plan workflow: ${states.length} states, ${transitions.length} transitions`);
}
//# sourceMappingURL=workflow-tour-plan.seed.js.map