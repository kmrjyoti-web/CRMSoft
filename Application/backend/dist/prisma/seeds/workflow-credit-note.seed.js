"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedCreditNoteWorkflow = seedCreditNoteWorkflow;
async function seedCreditNoteWorkflow(prisma, adminId, tenantId) {
    const workflow = await prisma.workflow.upsert({
        where: { tenantId_code: { tenantId, code: 'CREDIT_NOTE_APPROVAL_V1' } },
        update: {},
        create: {
            tenantId,
            name: 'Credit Note Approval',
            code: 'CREDIT_NOTE_APPROVAL_V1',
            entityType: 'CREDIT_NOTE',
            description: 'Credit note approval workflow with adjustment tracking',
            isDefault: true,
            version: 1,
            createdById: adminId,
        },
    });
    const states = [
        { name: 'Draft', code: 'DRAFT', stateType: 'INITIAL', color: '#94A3B8', sortOrder: 0 },
        { name: 'Pending Approval', code: 'PENDING_APPROVAL', stateType: 'INTERMEDIATE', color: '#F59E0B', sortOrder: 1 },
        { name: 'Issued', code: 'ISSUED', stateType: 'INTERMEDIATE', color: '#3B82F6', sortOrder: 2 },
        { name: 'Partially Adjusted', code: 'PARTIALLY_ADJUSTED', stateType: 'INTERMEDIATE', color: '#8B5CF6', sortOrder: 3 },
        { name: 'Fully Adjusted', code: 'FULLY_ADJUSTED', stateType: 'TERMINAL', category: 'SUCCESS', color: '#10B981', sortOrder: 4 },
        { name: 'Cancelled', code: 'CANCELLED', stateType: 'TERMINAL', category: 'FAILURE', color: '#EF4444', sortOrder: 5 },
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
        { from: 'DRAFT', to: 'PENDING_APPROVAL', code: 'SUBMIT_CN', name: 'Submit for Approval' },
        { from: 'PENDING_APPROVAL', to: 'ISSUED', code: 'APPROVE_CN', name: 'Approve & Issue' },
        { from: 'PENDING_APPROVAL', to: 'CANCELLED', code: 'REJECT_CN', name: 'Reject' },
        { from: 'ISSUED', to: 'PARTIALLY_ADJUSTED', code: 'PARTIAL_ADJUST', name: 'Partial Adjustment' },
        { from: 'ISSUED', to: 'FULLY_ADJUSTED', code: 'FULL_ADJUST', name: 'Full Adjustment' },
        { from: 'PARTIALLY_ADJUSTED', to: 'FULLY_ADJUSTED', code: 'COMPLETE_ADJUST', name: 'Complete Adjustment' },
        { from: 'ISSUED', to: 'CANCELLED', code: 'CANCEL_CN', name: 'Cancel Credit Note' },
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
    console.log(`  ✓ Credit Note Approval workflow: ${states.length} states, ${transitions.length} transitions`);
}
//# sourceMappingURL=workflow-credit-note.seed.js.map