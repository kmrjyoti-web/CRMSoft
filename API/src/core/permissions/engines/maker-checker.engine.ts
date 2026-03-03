import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PermissionContext } from '../types/permission-context';

/**
 * Maker-Checker Engine — approval workflow.
 * Determines if an action requires approval, and manages the approval lifecycle.
 */
@Injectable()
export class MakerCheckerEngine {
  constructor(private readonly prisma: PrismaService) {}

  /** Check if the action requires maker-checker approval. */
  async requiresApproval(ctx: PermissionContext): Promise<{
    required: boolean;
    checkerRole?: string;
  }> {
    const rule = await this.findRule(ctx);
    if (!rule) return { required: false };
    if (rule.skipForRoles.includes(ctx.roleName)) return { required: false };

    if (rule.amountThreshold && rule.amountField && ctx.attributes) {
      const amount = ctx.attributes[rule.amountField] ?? ctx.attributes.amount;
      if (amount !== undefined && amount < rule.amountThreshold) {
        return { required: false };
      }
    }

    return { required: true, checkerRole: rule.checkerRole };
  }

  /** Submit an action for approval. Creates a PENDING request. */
  async submit(ctx: PermissionContext, makerNote?: string) {
    const { required, checkerRole } = await this.requiresApproval(ctx);
    if (!required) return null;

    const rule = await this.findRule(ctx);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (rule?.expiryHours || 48));

    return this.prisma.approvalRequest.create({
      data: {
        entityType: ctx.resourceType || '',
        entityId: ctx.resourceId,
        action: ctx.action,
        payload: ctx.attributes || {},
        makerId: ctx.userId,
        checkerRole: checkerRole!,
        status: 'PENDING',
        makerNote,
        expiresAt,
      },
    });
  }

  /** Approve a pending request. Validates checker and prevents self-approval. */
  async approve(requestId: string, checkerId: string, note?: string) {
    const request = await this.prisma.approvalRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) throw new BadRequestException('Request not found');
    if (request.status !== 'PENDING') throw new BadRequestException('Request is not pending');
    if (request.makerId === checkerId) throw new BadRequestException('Self-approval is not allowed');
    if (new Date() > request.expiresAt) {
      await this.prisma.approvalRequest.update({
        where: { id: requestId },
        data: { status: 'EXPIRED' },
      });
      throw new BadRequestException('Request has expired');
    }

    return this.prisma.approvalRequest.update({
      where: { id: requestId },
      data: { status: 'APPROVED', checkerId, checkerNote: note, decidedAt: new Date() },
    });
  }

  /** Reject a pending request. */
  async reject(requestId: string, checkerId: string, note?: string) {
    const request = await this.prisma.approvalRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) throw new BadRequestException('Request not found');
    if (request.status !== 'PENDING') throw new BadRequestException('Request is not pending');

    return this.prisma.approvalRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED', checkerId, checkerNote: note, decidedAt: new Date() },
    });
  }

  /** Get pending approval requests for a checker role. */
  async getPendingForRole(checkerRole: string) {
    return this.prisma.approvalRequest.findMany({
      where: {
        checkerRole,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
      include: { maker: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Check if an approved request exists for this action+entity. */
  async hasApproval(action: string, entityId: string, makerId: string): Promise<boolean> {
    const found = await this.prisma.approvalRequest.findFirst({
      where: { action, entityId, makerId, status: 'APPROVED', expiresAt: { gt: new Date() } },
    });
    return !!found;
  }

  private async findRule(ctx: PermissionContext) {
    const exact = await this.prisma.approvalRule.findFirst({
      where: { entityType: ctx.resourceType || '', action: ctx.action, isActive: true },
    });
    if (exact) return exact;

    return this.prisma.approvalRule.findFirst({
      where: { entityType: ctx.resourceType || '', action: '*', isActive: true },
    });
  }
}
