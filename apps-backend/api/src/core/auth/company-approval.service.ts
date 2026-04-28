import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompanyApprovalService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Pending member approval queue ───────────────────────────────────────────

  async listPendingMembers(companyId: string, requesterId: string) {
    await this.assertAdminOrOwner(requesterId, companyId);
    return (this.prisma.identity as any).userCompanyMapping.findMany({
      where: { companyId, status: 'PENDING', isDeleted: false },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, categoryCode: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async approveMember(companyId: string, mappingId: string, approverId: string) {
    await this.assertAdminOrOwner(approverId, companyId);
    const mapping = await this.getMappingOrFail(mappingId, companyId);
    if (mapping.status !== 'PENDING') {
      throw new BadRequestException(`Cannot approve mapping in status: ${mapping.status}`);
    }
    const updated = await (this.prisma.identity as any).userCompanyMapping.update({
      where: { id: mappingId },
      data: { status: 'ACTIVE', approvedBy: approverId, approvedAt: new Date() },
    });
    await (this.prisma.identity as any).userCompanyMappingLog.create({
      data: {
        mappingId,
        changedBy: approverId,
        action: 'APPROVED',
        fromStatus: 'PENDING',
        toStatus: 'ACTIVE',
        note: 'Approved by admin',
      },
    });
    return updated;
  }

  async rejectMember(companyId: string, mappingId: string, rejecterId: string, reason: string) {
    await this.assertAdminOrOwner(rejecterId, companyId);
    const mapping = await this.getMappingOrFail(mappingId, companyId);
    if (mapping.status !== 'PENDING') {
      throw new BadRequestException(`Cannot reject mapping in status: ${mapping.status}`);
    }
    const updated = await (this.prisma.identity as any).userCompanyMapping.update({
      where: { id: mappingId },
      data: {
        status: 'REJECTED',
        rejectedBy: rejecterId,
        rejectedAt: new Date(),
        rejectionReason: reason,
      },
    });
    await (this.prisma.identity as any).userCompanyMappingLog.create({
      data: {
        mappingId,
        changedBy: rejecterId,
        action: 'REJECTED',
        fromStatus: 'PENDING',
        toStatus: 'REJECTED',
        note: reason,
      },
    });
    return updated;
  }

  // ─── Subscription requests (Company → Company) ────────────────────────────────

  async createSubscriptionRequest(params: {
    requesterCompanyId: string;
    targetCompanyId: string;
    requesterUserId: string;
    reason?: string;
  }) {
    const [requester, target] = await Promise.all([
      (this.prisma.identity as any).company.findUnique({ where: { id: params.requesterCompanyId } }),
      (this.prisma.identity as any).company.findUnique({ where: { id: params.targetCompanyId } }),
    ]);
    if (!requester) throw new NotFoundException('Requester company not found');
    if (!target)    throw new NotFoundException('Target company not found');

    await this.assertMember(params.requesterUserId, params.requesterCompanyId);

    const existing = await (this.prisma.identity as any).companySubscriptionRequest.findUnique({
      where: {
        requesterCompanyId_targetCompanyId: {
          requesterCompanyId: params.requesterCompanyId,
          targetCompanyId: params.targetCompanyId,
        },
      },
    });
    if (existing && existing.status === 'PENDING') {
      throw new BadRequestException('A pending subscription request already exists');
    }

    return (this.prisma.identity as any).companySubscriptionRequest.create({
      data: {
        requesterCompanyId: params.requesterCompanyId,
        targetCompanyId: params.targetCompanyId,
        requesterUserId: params.requesterUserId,
        status: 'PENDING',
        reason: params.reason ?? null,
      },
    });
  }

  async listSubscriptionRequests(companyId: string, requesterId: string) {
    await this.assertAdminOrOwner(requesterId, companyId);
    return (this.prisma.identity as any).companySubscriptionRequest.findMany({
      where: { targetCompanyId: companyId, status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
    });
  }

  async approveSubscriptionRequest(companyId: string, requestId: string, approverId: string) {
    await this.assertAdminOrOwner(approverId, companyId);
    const req = await this.getSubRequestOrFail(requestId, companyId);
    return (this.prisma.identity as any).companySubscriptionRequest.update({
      where: { id: requestId },
      data: { status: 'APPROVED', reviewedByUserId: approverId, reviewedAt: new Date() },
    });
  }

  async rejectSubscriptionRequest(
    companyId: string, requestId: string, rejecterId: string, reason: string,
  ) {
    await this.assertAdminOrOwner(rejecterId, companyId);
    await this.getSubRequestOrFail(requestId, companyId);
    return (this.prisma.identity as any).companySubscriptionRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        reviewedByUserId: rejecterId,
        reviewedAt: new Date(),
      },
    });
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private async assertAdminOrOwner(userId: string, companyId: string) {
    const mapping = await (this.prisma.identity as any).userCompanyMapping.findFirst({
      where: { userId, companyId, status: 'ACTIVE', isDeleted: false, role: { in: ['OWNER', 'ADMIN'] } },
    });
    if (!mapping) throw new ForbiddenException('Only company OWNER or ADMIN can perform this action');
  }

  private async assertMember(userId: string, companyId: string) {
    const mapping = await (this.prisma.identity as any).userCompanyMapping.findFirst({
      where: { userId, companyId, status: 'ACTIVE', isDeleted: false },
    });
    if (!mapping) throw new ForbiddenException('You are not a member of this company');
  }

  private async getMappingOrFail(mappingId: string, companyId: string) {
    const mapping = await (this.prisma.identity as any).userCompanyMapping.findFirst({
      where: { id: mappingId, companyId },
    });
    if (!mapping) throw new NotFoundException('Member mapping not found');
    return mapping;
  }

  private async getSubRequestOrFail(requestId: string, targetCompanyId: string) {
    const req = await (this.prisma.identity as any).companySubscriptionRequest.findFirst({
      where: { id: requestId, targetCompanyId },
    });
    if (!req) throw new NotFoundException('Subscription request not found');
    return req;
  }
}
