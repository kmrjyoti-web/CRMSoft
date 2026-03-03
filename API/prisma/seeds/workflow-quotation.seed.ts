import { PrismaClient } from '@prisma/client';

export async function seedQuotationWorkflow(prisma: PrismaClient, adminId: string, tenantId: string) {
  const workflow = await prisma.workflow.upsert({
    where: { tenantId_code: { tenantId, code: 'QUOTATION_PIPELINE_V1' } },
    update: {},
    create: {
      tenantId,
      name: 'Quotation Pipeline',
      code: 'QUOTATION_PIPELINE_V1',
      entityType: 'QUOTATION',
      description: 'Default CRM quotation lifecycle workflow',
      isDefault: true,
      version: 1,
      createdById: adminId,
    },
  });

  const states = [
    { name: 'Draft', code: 'DRAFT', stateType: 'INITIAL' as const, color: '#94A3B8', sortOrder: 0 },
    { name: 'Sent', code: 'SENT', stateType: 'INTERMEDIATE' as const, color: '#3B82F6', sortOrder: 1 },
    { name: 'Viewed', code: 'VIEWED', stateType: 'INTERMEDIATE' as const, color: '#8B5CF6', sortOrder: 2 },
    { name: 'Accepted', code: 'ACCEPTED', stateType: 'TERMINAL' as const, category: 'SUCCESS' as const, color: '#10B981', sortOrder: 3 },
    { name: 'Rejected', code: 'REJECTED', stateType: 'TERMINAL' as const, category: 'FAILURE' as const, color: '#EF4444', sortOrder: 4 },
    { name: 'Expired', code: 'EXPIRED', stateType: 'TERMINAL' as const, category: 'FAILURE' as const, color: '#9CA3AF', sortOrder: 5 },
    { name: 'Revised', code: 'REVISED', stateType: 'INTERMEDIATE' as const, color: '#F59E0B', sortOrder: 6 },
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
    { from: 'DRAFT', to: 'SENT', code: 'SEND_QUOTATION', name: 'Send Quotation' },
    { from: 'DRAFT', to: 'REVISED', code: 'REVISE_DRAFT', name: 'Revise Draft' },
    { from: 'SENT', to: 'VIEWED', code: 'MARK_VIEWED', name: 'Mark as Viewed' },
    { from: 'SENT', to: 'ACCEPTED', code: 'ACCEPT_SENT', name: 'Accept Quotation' },
    { from: 'SENT', to: 'REJECTED', code: 'REJECT_SENT', name: 'Reject Quotation' },
    { from: 'SENT', to: 'EXPIRED', code: 'EXPIRE_SENT', name: 'Mark Expired' },
    { from: 'SENT', to: 'REVISED', code: 'REVISE_SENT', name: 'Revise Quotation' },
    { from: 'VIEWED', to: 'ACCEPTED', code: 'ACCEPT_VIEWED', name: 'Accept Quotation' },
    { from: 'VIEWED', to: 'REJECTED', code: 'REJECT_VIEWED', name: 'Reject Quotation' },
    { from: 'VIEWED', to: 'EXPIRED', code: 'EXPIRE_VIEWED', name: 'Mark Expired' },
    { from: 'VIEWED', to: 'REVISED', code: 'REVISE_VIEWED', name: 'Revise Quotation' },
    { from: 'REVISED', to: 'SENT', code: 'RESEND_REVISED', name: 'Send Revised Quotation' },
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
        triggerType: t.code === 'EXPIRE_SENT' || t.code === 'EXPIRE_VIEWED' ? 'SCHEDULED' : 'MANUAL',
      },
    });
  }

  console.log(`  ✓ Quotation Pipeline workflow: ${states.length} states, ${transitions.length} transitions`);
}
