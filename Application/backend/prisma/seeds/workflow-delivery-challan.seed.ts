import { PrismaClient } from '@prisma/client';

export async function seedDeliveryChallanWorkflow(prisma: PrismaClient, adminId: string, tenantId: string) {
  const workflow = await prisma.workflow.upsert({
    where: { tenantId_code: { tenantId, code: 'DELIVERY_DISPATCH_V1' } },
    update: {},
    create: {
      tenantId,
      name: 'Delivery Dispatch Approval',
      code: 'DELIVERY_DISPATCH_V1',
      entityType: 'DELIVERY_CHALLAN',
      description: 'Delivery challan dispatch workflow with approval gate',
      isDefault: true,
      version: 1,
      createdById: adminId,
    },
  });

  const states = [
    { name: 'Draft', code: 'DRAFT', stateType: 'INITIAL' as const, color: '#94A3B8', sortOrder: 0 },
    { name: 'Pending Dispatch', code: 'PENDING_DISPATCH', stateType: 'INTERMEDIATE' as const, color: '#F59E0B', sortOrder: 1 },
    { name: 'Dispatched', code: 'DISPATCHED', stateType: 'INTERMEDIATE' as const, color: '#3B82F6', sortOrder: 2 },
    { name: 'In Transit', code: 'IN_TRANSIT', stateType: 'INTERMEDIATE' as const, color: '#8B5CF6', sortOrder: 3 },
    { name: 'Delivered', code: 'DELIVERED', stateType: 'TERMINAL' as const, category: 'SUCCESS' as const, color: '#10B981', sortOrder: 4 },
    { name: 'Cancelled', code: 'CANCELLED', stateType: 'TERMINAL' as const, category: 'FAILURE' as const, color: '#EF4444', sortOrder: 5 },
  ];

  const stateMap: Record<string, string> = {};
  for (const s of states) {
    const state = await prisma.workflowState.upsert({
      where: { tenantId_workflowId_code: { tenantId, workflowId: workflow.id, code: s.code } },
      update: {},
      create: { tenantId, workflowId: workflow.id, name: s.name, code: s.code, stateType: s.stateType, category: (s as any).category, color: s.color, sortOrder: s.sortOrder },
    });
    stateMap[s.code] = state.id;
  }

  const transitions = [
    { from: 'DRAFT', to: 'PENDING_DISPATCH', code: 'SUBMIT_DISPATCH', name: 'Submit for Dispatch' },
    { from: 'PENDING_DISPATCH', to: 'DISPATCHED', code: 'APPROVE_DISPATCH', name: 'Approve & Dispatch' },
    { from: 'PENDING_DISPATCH', to: 'CANCELLED', code: 'CANCEL_PENDING', name: 'Cancel Challan' },
    { from: 'DISPATCHED', to: 'IN_TRANSIT', code: 'MARK_IN_TRANSIT', name: 'Mark In Transit' },
    { from: 'DISPATCHED', to: 'DELIVERED', code: 'MARK_DELIVERED_DIRECT', name: 'Mark Delivered' },
    { from: 'IN_TRANSIT', to: 'DELIVERED', code: 'MARK_DELIVERED', name: 'Mark Delivered' },
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

  console.log(`  ✓ Delivery Dispatch workflow: ${states.length} states, ${transitions.length} transitions`);
}
