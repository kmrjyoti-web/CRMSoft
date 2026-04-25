import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ConfigService } from '@nestjs/config';

const execAsync = promisify(exec);

export interface ProvisionResult {
  success: boolean;
  databases: string[];
  duration: number;
  error?: string;
}

@Injectable()
export class ProvisioningService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private config: ConfigService,
  ) {}

  private getDbNames(partnerCode: string) {
    const code = partnerCode.replace(/-/g, '_');
    return {
      identity: `identity_${code}`,
      platform: `platform_${code}`,
      working: `working_${code}`,
      marketplace: `marketplace_${code}`,
    };
  }

  async provision(partnerId: string): Promise<ProvisionResult> {
    const start = Date.now();
    const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { id: partnerId } });
    if (!partner) throw new NotFoundException('Partner not found');
    if (partner.dbConnectionConfig) throw new BadRequestException('Partner already provisioned');

    const dbNames = this.getDbNames(partner.partnerCode);
    const created: string[] = [];
    const pgUser = this.config.get('POSTGRES_USER', 'postgres');
    const pgHost = this.config.get('POSTGRES_HOST', 'localhost');
    const pgPassword = this.config.get('POSTGRES_PASSWORD', 'postgres');
    const pgPort = this.config.get('POSTGRES_PORT', '5432');

    try {
      // Create each database
      for (const [key, dbName] of Object.entries(dbNames)) {
        try {
          await execAsync(
            `PGPASSWORD=${pgPassword} createdb -h ${pgHost} -p ${pgPort} -U ${pgUser} "${dbName}" 2>/dev/null || echo "db_exists"`,
          );
          created.push(dbName);
        } catch {
          // DB may already exist — that's OK
          created.push(dbName);
        }
      }

      // Build connection config
      const dbConnectionConfig: Record<string, string> = {};
      for (const [key, dbName] of Object.entries(dbNames)) {
        dbConnectionConfig[key] = `postgresql://${pgUser}:${pgPassword}@${pgHost}:${pgPort}/${dbName}`;
      }

      // Create default feature flags
      const defaultFeatures = [
        { featureCode: 'CRM_CORE', isEnabled: true },
        { featureCode: 'LEADS', isEnabled: true },
        { featureCode: 'CONTACTS', isEnabled: true },
        { featureCode: 'QUOTATIONS', isEnabled: true },
        { featureCode: 'INVOICING', isEnabled: true },
        { featureCode: 'MARKETPLACE', isEnabled: false },
        { featureCode: 'AI_WORKFLOWS', isEnabled: false },
        { featureCode: 'WHATSAPP_CHAT', isEnabled: false },
        { featureCode: 'CUSTOM_DOMAIN', isEnabled: false },
        { featureCode: 'REPORT_DESIGNER', isEnabled: true },
        { featureCode: 'WORKFLOW_BUILDER', isEnabled: true },
        { featureCode: 'MULTI_LANGUAGE', isEnabled: false },
      ];

      for (const flag of defaultFeatures) {
        await this.prisma.partnerFeatureFlag.upsert({
          where: { partnerId_featureCode: { partnerId, featureCode: flag.featureCode } },
          create: { partnerId, ...flag },
          update: flag,
        });
      }

      // Update partner
      await this.prisma.whiteLabelPartner.update({
        where: { id: partnerId },
        data: { dbConnectionConfig, status: 'ACTIVE', onboardedAt: new Date() },
      });

      // Create deployment record
      await this.prisma.partnerDeployment.upsert({
        where: { partnerId },
        create: { partnerId, status: 'STOPPED', deploymentType: 'SHARED_INFRA' },
        update: { status: 'STOPPED' },
      });

      await this.audit.log({
        partnerId,
        action: 'PARTNER_PROVISIONED',
        performedBy: 'system',
        performedByRole: 'MASTER_ADMIN',
        details: { databases: created },
      });

      return { success: true, databases: created, duration: Date.now() - start };
    } catch (error: any) {
      // Rollback: attempt to drop created DBs
      for (const dbName of created) {
        try {
          await execAsync(
            `PGPASSWORD=${pgPassword} dropdb -h ${pgHost} -p ${pgPort} -U ${pgUser} --if-exists "${dbName}"`,
          );
        } catch { /* ignore rollback errors */ }
      }
      return { success: false, databases: [], duration: Date.now() - start, error: error.message };
    }
  }

  async getStatus(partnerId: string) {
    const partner = await this.prisma.whiteLabelPartner.findUnique({
      where: { id: partnerId },
      include: { deployment: true, featureFlags: true },
    });
    if (!partner) throw new NotFoundException('Partner not found');
    const dbConfig = partner.dbConnectionConfig as Record<string, string> | null;
    const databases = dbConfig
      ? Object.entries(dbConfig).map(([key, url]) => ({
          key,
          url: url.replace(/:\/\/.*@/, '://***@'),
          status: 'ACTIVE',
        }))
      : [];
    return {
      partnerId,
      isProvisioned: !!dbConfig,
      status: partner.status,
      databases,
      featureFlags: partner.featureFlags,
      deployment: partner.deployment,
    };
  }

  async deprovision(partnerId: string, confirmation: string) {
    const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { id: partnerId } });
    if (!partner) throw new NotFoundException('Partner not found');
    if (confirmation !== `DELETE-${partner.partnerCode}`) {
      throw new BadRequestException(`Confirmation must be "DELETE-${partner.partnerCode}"`);
    }

    const pgUser = this.config.get('POSTGRES_USER', 'postgres');
    const pgHost = this.config.get('POSTGRES_HOST', 'localhost');
    const pgPassword = this.config.get('POSTGRES_PASSWORD', 'postgres');
    const pgPort = this.config.get('POSTGRES_PORT', '5432');
    const dbNames = this.getDbNames(partner.partnerCode);

    for (const dbName of Object.values(dbNames)) {
      try {
        await execAsync(
          `PGPASSWORD=${pgPassword} dropdb -h ${pgHost} -p ${pgPort} -U ${pgUser} --if-exists "${dbName}"`,
        );
      } catch { /* ignore */ }
    }

    await this.prisma.whiteLabelPartner.update({
      where: { id: partnerId },
      data: { dbConnectionConfig: 'null' as any, status: 'CANCELLED' },
    });

    await this.audit.log({
      partnerId,
      action: 'PARTNER_DEPROVISIONED',
      performedBy: 'admin',
      performedByRole: 'MASTER_ADMIN',
      details: { databases: Object.values(dbNames) },
    });
  }

  async reprovision(partnerId: string) {
    const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { id: partnerId } });
    if (!partner) throw new NotFoundException('Partner not found');
    if (partner.dbConnectionConfig) {
      await this.deprovision(partnerId, `DELETE-${partner.partnerCode}`);
    }
    await this.prisma.whiteLabelPartner.update({ where: { id: partnerId }, data: { dbConnectionConfig: 'null' as any } });
    return this.provision(partnerId);
  }

  async getDatabases(partnerId: string) {
    const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { id: partnerId } });
    if (!partner) throw new NotFoundException('Partner not found');
    const dbConfig = partner.dbConnectionConfig as Record<string, string> | null;
    if (!dbConfig) return { provisioned: false, databases: [] };

    const databases = Object.entries(dbConfig).map(([key, url]) => ({
      key,
      dbName: url.split('/').pop(),
      connectionUrl: url.replace(/:\/\/.*@/, '://***@'),
      status: 'ACTIVE',
    }));
    return { provisioned: true, databases };
  }
}
