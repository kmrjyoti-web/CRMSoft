import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

const INVITE_TTL_DAYS = 7;

@Injectable()
export class CompanyInviteService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── A. Create invite ────────────────────────────────────────────────────────

  async createInvite(params: {
    companyId: string;
    invitedByUserId: string;
    inviteeEmail?: string;
    role?: string;
    personalMessage?: string;
    sentVia?: string;
  }) {
    // Validate: inviter is OWNER or ADMIN of this company
    const inviterMapping = await (this.prisma.identity as any).userCompanyMapping.findFirst({
      where: {
        userId: params.invitedByUserId,
        companyId: params.companyId,
        status: 'ACTIVE',
        isDeleted: false,
        role: { in: ['OWNER', 'ADMIN'] },
      },
    });
    if (!inviterMapping) {
      throw new ForbiddenException('Only company OWNER or ADMIN can send invites');
    }

    // Validate: inviteeEmail not already an active member
    if (params.inviteeEmail) {
      const user = await this.prisma.identity.user.findFirst({
        where: { email: params.inviteeEmail },
      });
      if (user) {
        const existing = await (this.prisma.identity as any).userCompanyMapping.findFirst({
          where: { userId: user.id, companyId: params.companyId, status: 'ACTIVE', isDeleted: false },
        });
        if (existing) {
          throw new BadRequestException('This user is already a member of this company');
        }
      }
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);

    const invite = await (this.prisma.identity as any).companyInvite.create({
      data: {
        companyId: params.companyId,
        invitedByUserId: params.invitedByUserId,
        inviteeEmail: params.inviteeEmail ?? null,
        role: params.role ?? 'MEMBER',
        token,
        status: 'PENDING',
        expiresAt,
        personalMessage: params.personalMessage ?? null,
        sentVia: params.sentVia ?? 'EMAIL',
      },
    });

    return {
      inviteId: invite.id,
      token: invite.token,
      inviteLink: `/invite/${invite.token}`,
      expiresAt: invite.expiresAt,
    };
  }

  // ─── B. Accept invite ────────────────────────────────────────────────────────

  async acceptInvite(token: string, userId: string) {
    const invite = await (this.prisma.identity as any).companyInvite.findUnique({
      where: { token },
    });
    if (!invite) throw new NotFoundException('Invite not found');
    if (invite.status !== 'PENDING') {
      throw new BadRequestException(`Invite is already ${invite.status.toLowerCase()}`);
    }
    if (new Date() > new Date(invite.expiresAt)) {
      await (this.prisma.identity as any).companyInvite.update({
        where: { id: invite.id },
        data: { status: 'EXPIRED' },
      });
      throw new BadRequestException('Invite has expired');
    }

    // Check if already a member
    const existing = await (this.prisma.identity as any).userCompanyMapping.findFirst({
      where: { userId, companyId: invite.companyId, isDeleted: false },
    });
    if (existing && existing.status === 'ACTIVE') {
      throw new BadRequestException('You are already a member of this company');
    }

    const company = await (this.prisma.identity as any).company.findUnique({
      where: { id: invite.companyId },
    });
    if (!company) throw new NotFoundException('Company not found');

    // Create mapping (auto-approved for invites)
    const mapping = await (this.prisma.identity as any).userCompanyMapping.create({
      data: {
        userId,
        companyId: invite.companyId,
        role: invite.role,
        joinMode: 'INVITED',
        status: 'ACTIVE',
        isDefault: false,
        invitedBy: invite.invitedByUserId,
        brandCode: company.brandCode ?? null,
        verticalCode: company.verticalCode ?? null,
      },
    });

    await (this.prisma.identity as any).userCompanyMappingLog.create({
      data: {
        mappingId: mapping.id,
        changedBy: userId,
        action: 'CREATED',
        toStatus: 'ACTIVE',
        toRole: invite.role,
        note: `Accepted invite ${invite.id}`,
      },
    });

    // Mark invite accepted
    await (this.prisma.identity as any).companyInvite.update({
      where: { id: invite.id },
      data: { status: 'ACCEPTED', acceptedAt: new Date(), acceptedByUserId: userId },
    });

    return { mapping, company: { id: company.id, name: company.name } };
  }

  // ─── C. List invites ─────────────────────────────────────────────────────────

  async listInvites(companyId: string, status?: string) {
    const where: any = { companyId };
    if (status) where.status = status;
    return (this.prisma.identity as any).companyInvite.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── D. Revoke invite ────────────────────────────────────────────────────────

  async revokeInvite(inviteId: string, requesterId: string) {
    const invite = await (this.prisma.identity as any).companyInvite.findUnique({
      where: { id: inviteId },
    });
    if (!invite) throw new NotFoundException('Invite not found');

    const mapping = await (this.prisma.identity as any).userCompanyMapping.findFirst({
      where: {
        userId: requesterId,
        companyId: invite.companyId,
        status: 'ACTIVE',
        isDeleted: false,
        role: { in: ['OWNER', 'ADMIN'] },
      },
    });
    if (!mapping) throw new ForbiddenException('Only company OWNER or ADMIN can revoke invites');

    return (this.prisma.identity as any).companyInvite.update({
      where: { id: inviteId },
      data: { status: 'REVOKED' },
    });
  }

  // ─── E. Resend invite ────────────────────────────────────────────────────────

  async resendInvite(inviteId: string, requesterId: string) {
    const invite = await (this.prisma.identity as any).companyInvite.findUnique({
      where: { id: inviteId },
    });
    if (!invite) throw new NotFoundException('Invite not found');
    if (invite.status !== 'PENDING') {
      throw new BadRequestException('Can only resend a PENDING invite');
    }

    const mapping = await (this.prisma.identity as any).userCompanyMapping.findFirst({
      where: {
        userId: requesterId,
        companyId: invite.companyId,
        status: 'ACTIVE',
        isDeleted: false,
        role: { in: ['OWNER', 'ADMIN'] },
      },
    });
    if (!mapping) throw new ForbiddenException('Only company OWNER or ADMIN can resend invites');

    const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);
    const updated = await (this.prisma.identity as any).companyInvite.update({
      where: { id: inviteId },
      data: { expiresAt },
    });

    return { inviteId: updated.id, token: updated.token, expiresAt: updated.expiresAt };
  }

  // ─── F. Get invite by token (public) ─────────────────────────────────────────

  async getInviteByToken(token: string) {
    const invite = await (this.prisma.identity as any).companyInvite.findUnique({
      where: { token },
    });
    if (!invite) throw new NotFoundException('Invite not found');

    const company = await (this.prisma.identity as any).company.findUnique({
      where: { id: invite.companyId },
      select: { id: true, name: true, brandCode: true, verticalCode: true },
    });

    const inviter = await this.prisma.identity.user.findUnique({
      where: { id: invite.invitedByUserId },
      select: { id: true, firstName: true, lastName: true },
    });

    const isExpired = new Date() > new Date(invite.expiresAt);

    return {
      status: isExpired && invite.status === 'PENDING' ? 'EXPIRED' : invite.status,
      role: invite.role,
      company: company ?? null,
      invitedBy: inviter ? `${inviter.firstName} ${inviter.lastName}`.trim() : null,
      personalMessage: invite.personalMessage,
      expiresAt: invite.expiresAt,
    };
  }

  // ─── G. Cleanup expired (for CRON) ──────────────────────────────────────────

  async cleanupExpired() {
    const result = await (this.prisma.identity as any).companyInvite.updateMany({
      where: { status: 'PENDING', expiresAt: { lt: new Date() } },
      data: { status: 'EXPIRED' },
    });
    return { expired: result.count };
  }
}
