"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSaleOrderWorkflow = seedSaleOrderWorkflow;
async function seedSaleOrderWorkflow(prisma, adminId, tenantId) {
    const workflow = await prisma.workflow.upsert({
        where: { tenantId_code: { tenantId, code: 'SALE_ORDER_APPROVAL_V1' } },
        update: {},
        create: {
            tenantId,
            name: 'Sale Order Approval',
            code: 'SALE_ORDER_APPROVAL_V1',
            entityType: 'SALE_ORDER',
            description: 'Sale order lifecycle with maker-checker approval',
            isDefault: true,
            version: 1,
            createdById: adminId,
        },
    });
    const states = [
        { name: 'Draft', code: 'DRAFT', stateType: 'INITIAL', color: '#94A3B8', sortOrder: 0 },
        { name: 'Pending Approval', code: 'PENDING_APPROVAL', stateType: 'INTERMEDIATE', color: '#F59E0B', sortOrder: 1 },
        { name: 'Confirmed', code: 'CONFIRMED', stateType: 'INTERMEDIATE', color: '#3B82F6', sortOrder: 2 },
        { name: 'Partially Delivered', code: 'PARTIALLY_DELIVERED', stateType: 'INTERMEDIATE', color: '#8B5CF6', sortOrder: 3 },
        { name: 'Delivered', code: 'DELIVERED', stateType: 'INTERMEDIATE', color: '#06B6D4', sortOrder: 4 },
        { name: 'Invoiced', code: 'INVOICED', stateType: 'TERMINAL', category: 'SUCCESS', color: '#10B981', sortOrder: 5 },
        { name: 'Cancelled', code: 'CANCELLED', stateType: 'TERMINAL', category: 'FAILURE', color: '#EF4444', sortOrder: 6 },
        { name: 'Rejected', code: 'REJECTED', stateType: 'TERMINAL', category: 'FAILURE', color: '#DC2626', sortOrder: 7 },
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
        { from: 'PENDING_APPROVAL', to: 'CONFIRMED', code: 'APPROVE_ORDER', name: 'Approve Order' },
        { from: 'PENDING_APPROVAL', to: 'REJECTED', code: 'REJECT_ORDER', name: 'Reject Order' },
        { from: 'CONFIRMED', to: 'PARTIALLY_DELIVERED', code: 'PARTIAL_DELIVERY', name: 'Partial Delivery' },
        { from: 'CONFIRMED', to: 'DELIVERED', code: 'FULL_DELIVERY', name: 'Full Delivery' },
        { from: 'CONFIRMED', to: 'INVOICED', code: 'DIRECT_INVOICE', name: 'Convert to Invoice' },
        { from: 'CONFIRMED', to: 'CANCELLED', code: 'CANCEL_CONFIRMED', name: 'Cancel Order' },
        { from: 'PARTIALLY_DELIVERED', to: 'DELIVERED', code: 'COMPLETE_DELIVERY', name: 'Complete Delivery' },
        { from: 'DELIVERED', to: 'INVOICED', code: 'CREATE_INVOICE', name: 'Create Invoice' },
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
    console.log(`  ✓ Sale Order Approval workflow: ${states.length} states, ${transitions.length} transitions`);
}
//# sourceMappingURL=workflow-sale-order.seed.js.map