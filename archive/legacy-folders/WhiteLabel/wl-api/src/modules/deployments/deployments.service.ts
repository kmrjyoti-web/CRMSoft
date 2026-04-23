import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class DeploymentsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private config: ConfigService,
  ) {}

  async deploy(partnerId: string, params: { version?: string; gitTag?: string; deployedBy?: string }) {
    const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { id: partnerId }, include: { gitBranches: { where: { branchType: 'MAIN', isActive: true } } } });
    if (!partner) throw new NotFoundException('Partner not found');

    const gitBranch = partner.gitBranches[0]?.branchName || `partner/${partner.partnerCode}/main`;
    const version = params.version || new Date().toISOString().split('T')[0];

    // Update deployment to DEPLOYING
    const deployment = await this.prisma.partnerDeployment.upsert({
      where: { partnerId },
      create: { partnerId, status: 'DEPLOYING', gitBranch, currentVersion: version, deployedBy: params.deployedBy || 'admin', deployedAt: new Date() },
      update: { status: 'DEPLOYING', gitBranch, currentVersion: version, deployedBy: params.deployedBy || 'admin', deployedAt: new Date() },
    });

    // Simulate build (in production: actually run build + PM2 restart)
    // For now, mark as RUNNING after brief validation
    const updatedDeployment = await this.prisma.partnerDeployment.update({
      where: { partnerId },
      data: { status: 'RUNNING', lastHealthCheck: new Date(), healthStatus: 'healthy' },
    });

    await this.audit.log({
      partnerId,
      action: 'PARTNER_DEPLOYED',
      performedBy: params.deployedBy || 'admin',
      performedByRole: 'MASTER_ADMIN',
      details: { version, gitBranch, gitTag: params.gitTag },
    });

    return updatedDeployment;
  }

  async rollback(partnerId: string, targetVersion: string) {
    const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { id: partnerId } });
    if (!partner) throw new NotFoundException('Partner not found');

    const deployment = await this.prisma.partnerDeployment.update({
      where: { partnerId },
      data: { status: 'DEPLOYING', currentVersion: targetVersion, deployedAt: new Date() },
    });

    // Simulate rollback
    const updated = await this.prisma.partnerDeployment.update({
      where: { partnerId },
      data: { status: 'RUNNING', lastHealthCheck: new Date(), healthStatus: 'healthy' },
    });

    await this.audit.log({
      partnerId,
      action: 'PARTNER_ROLLED_BACK',
      performedBy: 'admin',
      performedByRole: 'MASTER_ADMIN',
      details: { targetVersion },
    });

    return updated;
  }

  async getDeployment(partnerId: string) {
    const deployment = await this.prisma.partnerDeployment.findUnique({ where: { partnerId } });
    if (!deployment) return { partnerId, status: 'NOT_DEPLOYED', isDeployed: false };
    return deployment;
  }

  async checkHealth(partnerId: string) {
    const deployment = await this.prisma.partnerDeployment.findUnique({ where: { partnerId } });
    if (!deployment) return { partnerId, status: 'NOT_DEPLOYED', healthy: false };

    // In production: HTTP GET partner's /health endpoint
    // For now: return mock based on deployment status
    const healthy = deployment.status === 'RUNNING';
    const healthStatus = healthy ? 'healthy' : 'degraded';

    await this.prisma.partnerDeployment.update({
      where: { partnerId },
      data: { lastHealthCheck: new Date(), healthStatus },
    });

    return { partnerId, status: deployment.status, healthy, healthStatus, lastCheck: new Date() };
  }

  async getHistory(partnerId: string) {
    const logs = await this.prisma.partnerAuditLog.findMany({
      where: { partnerId, action: { in: ['PARTNER_DEPLOYED', 'PARTNER_ROLLED_BACK'] } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return logs;
  }

  async checkAllHealth() {
    const deployments = await this.prisma.partnerDeployment.findMany({
      where: { status: 'RUNNING' },
      include: { partner: { select: { partnerCode: true, companyName: true } } },
    });

    const results = await Promise.all(
      deployments.map(async (d) => this.checkHealth(d.partnerId)),
    );

    return { checked: results.length, results };
  }
}
