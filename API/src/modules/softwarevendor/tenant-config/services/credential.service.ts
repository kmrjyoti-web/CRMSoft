import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CredentialProvider, CredentialStatus } from '@prisma/client';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { EncryptionService } from './encryption.service';
import { CredentialSchemaService } from './credential-schema.service';

interface CredentialCacheEntry {
  data: Record<string, any>;
  expiresAt: number;
}

@Injectable()
export class CredentialService {
  private readonly cache = new Map<string, CredentialCacheEntry>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
    private readonly schemaService: CredentialSchemaService,
  ) {}

  async get(
    tenantId: string,
    provider: CredentialProvider,
    instanceName?: string,
  ): Promise<Record<string, any> | null> {
    const cacheKey = `${tenantId}:${provider}:${instanceName || 'primary'}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    // 1. Look for tenant-specific credential
    const where: any = { tenantId, provider, status: 'ACTIVE' };
    if (instanceName) {
      where.instanceName = instanceName;
    } else {
      where.isPrimary = true;
    }

    let credential = await this.prisma.tenantCredential.findFirst({ where });

    // 2. Fallback to global default
    if (!credential) {
      const globalDefault = await this.prisma.globalDefaultCredential.findFirst({
        where: { provider, isEnabled: true, status: 'ACTIVE' },
      });
      if (globalDefault) {
        const data = this.encryption.decrypt(globalDefault.encryptedData);
        this.cache.set(cacheKey, { data, expiresAt: Date.now() + this.CACHE_TTL });
        return data;
      }
      return null;
    }

    // 3. Decrypt
    const data = this.encryption.decrypt(credential.encryptedData);

    // 4. Update usage stats (fire-and-forget)
    this.prisma.tenantCredential.update({
      where: { id: credential.id },
      data: {
        lastUsedAt: new Date(),
        usageCount: { increment: 1 },
        dailyUsageCount: { increment: 1 },
      },
    }).catch(() => {});

    // 5. Check daily usage limit
    if (credential.dailyUsageLimit && credential.dailyUsageCount >= credential.dailyUsageLimit) {
      return null; // Limit exceeded
    }

    // 6. Cache
    this.cache.set(cacheKey, { data, expiresAt: Date.now() + this.CACHE_TTL });
    return data;
  }

  async isConfigured(tenantId: string, provider: CredentialProvider): Promise<boolean> {
    const count = await this.prisma.tenantCredential.count({
      where: { tenantId, provider, status: { in: ['ACTIVE', 'PENDING_SETUP'] } },
    });
    return count > 0;
  }

  async listForTenant(tenantId: string) {
    const credentials = await this.prisma.tenantCredential.findMany({
      where: { tenantId },
      orderBy: [{ provider: 'asc' }, { isPrimary: 'desc' }],
    });

    return credentials.map((cred) => {
      const decrypted = this.encryption.decrypt(cred.encryptedData);
      const masked: Record<string, string> = {};
      for (const [key, val] of Object.entries(decrypted)) {
        masked[key] = this.encryption.mask(String(val));
      }

      return {
        id: cred.id,
        provider: cred.provider,
        instanceName: cred.instanceName,
        status: cred.status,
        statusMessage: cred.statusMessage,
        isPrimary: cred.isPrimary,
        lastVerifiedAt: cred.lastVerifiedAt,
        lastUsedAt: cred.lastUsedAt,
        usageCount: cred.usageCount,
        dailyUsageCount: cred.dailyUsageCount,
        dailyUsageLimit: cred.dailyUsageLimit,
        linkedAccountEmail: cred.linkedAccountEmail,
        description: cred.description,
        maskedCredentials: masked,
        createdAt: cred.createdAt,
      };
    });
  }

  async getDetail(tenantId: string, credentialId: string) {
    const cred = await this.prisma.tenantCredential.findFirst({
      where: { tenantId, id: credentialId },
    });

    if (!cred) throw new NotFoundException('Credential not found');

    const decrypted = this.encryption.decrypt(cred.encryptedData);
    const masked: Record<string, string> = {};
    for (const [key, val] of Object.entries(decrypted)) {
      masked[key] = this.encryption.mask(String(val));
    }

    return {
      id: cred.id,
      provider: cred.provider,
      instanceName: cred.instanceName,
      status: cred.status,
      statusMessage: cred.statusMessage,
      isPrimary: cred.isPrimary,
      lastVerifiedAt: cred.lastVerifiedAt,
      lastVerifyError: cred.lastVerifyError,
      verifyCount: cred.verifyCount,
      tokenExpiresAt: cred.tokenExpiresAt,
      lastRefreshedAt: cred.lastRefreshedAt,
      lastUsedAt: cred.lastUsedAt,
      usageCount: cred.usageCount,
      dailyUsageCount: cred.dailyUsageCount,
      dailyUsageLimit: cred.dailyUsageLimit,
      linkedAccountEmail: cred.linkedAccountEmail,
      webhookUrl: cred.webhookUrl,
      description: cred.description,
      maskedCredentials: masked,
      createdById: cred.createdById,
      createdByName: cred.createdByName,
      createdAt: cred.createdAt,
      updatedAt: cred.updatedAt,
    };
  }

  async upsert(
    tenantId: string,
    params: {
      provider: CredentialProvider;
      instanceName?: string;
      credentials: Record<string, any>;
      description?: string;
      isPrimary?: boolean;
      dailyUsageLimit?: number;
      linkedAccountEmail?: string;
      webhookUrl?: string;
      userId: string;
      userName: string;
    },
  ) {
    // Validate schema
    const validation = this.schemaService.validate(params.provider, params.credentials);
    if (!validation.valid) {
      throw new BadRequestException(validation.errors.join('; '));
    }

    const encryptedData = this.encryption.encrypt(params.credentials);
    const instanceName = params.instanceName || null;

    const result = await this.prisma.tenantCredential.upsert({
      where: {
        tenantId_provider_instanceName: {
          tenantId,
          provider: params.provider,
          instanceName: instanceName as string,
        },
      },
      create: {
        tenantId,
        provider: params.provider,
        instanceName,
        encryptedData,
        status: 'PENDING_SETUP',
        description: params.description,
        isPrimary: params.isPrimary ?? true,
        dailyUsageLimit: params.dailyUsageLimit,
        linkedAccountEmail: params.linkedAccountEmail,
        webhookUrl: params.webhookUrl,
        createdById: params.userId,
        createdByName: params.userName,
      },
      update: {
        encryptedData,
        status: 'PENDING_SETUP',
        description: params.description,
        isPrimary: params.isPrimary,
        dailyUsageLimit: params.dailyUsageLimit,
        linkedAccountEmail: params.linkedAccountEmail,
        webhookUrl: params.webhookUrl,
        updatedById: params.userId,
        lastVerifyError: null,
      },
    });

    // Log access
    await this.logAccess(tenantId, result.id, 'UPSERT', params.userId, params.userName, params.provider);

    // Invalidate cache
    this.cache.delete(`${tenantId}:${params.provider}:${instanceName || 'primary'}`);

    return result;
  }

  async revoke(tenantId: string, credentialId: string, userId: string, userName: string) {
    const cred = await this.prisma.tenantCredential.findFirst({
      where: { tenantId, id: credentialId },
    });

    if (!cred) throw new NotFoundException('Credential not found');

    await this.prisma.tenantCredential.update({
      where: { id: credentialId },
      data: {
        status: 'REVOKED',
        encryptedData: this.encryption.encrypt({ revoked: true }),
        updatedById: userId,
      },
    });

    await this.logAccess(tenantId, credentialId, 'REVOKE', userId, userName, cred.provider);
    this.cache.delete(`${tenantId}:${cred.provider}:${cred.instanceName || 'primary'}`);
  }

  async getStatusSummary(tenantId: string) {
    const credentials = await this.prisma.tenantCredential.findMany({
      where: { tenantId },
      select: { provider: true, status: true },
    });

    const allProviders = Object.values(CredentialProvider);
    const configuredProviders = new Set(credentials.map((c) => c.provider));

    const statusCounts: Record<string, number> = {};
    for (const cred of credentials) {
      statusCounts[cred.status] = (statusCounts[cred.status] || 0) + 1;
    }

    return {
      totalProviders: allProviders.length,
      configured: configuredProviders.size,
      active: statusCounts['ACTIVE'] || 0,
      expired: statusCounts['EXPIRED'] || 0,
      errors: statusCounts['ERROR'] || 0,
      pendingSetup: statusCounts['PENDING_SETUP'] || 0,
      missing: allProviders.filter((p) => !configuredProviders.has(p)),
    };
  }

  async logAccess(
    tenantId: string,
    credentialId: string,
    action: string,
    userId: string,
    userName: string,
    provider: CredentialProvider | string,
    details?: string,
    ip?: string,
  ) {
    await this.prisma.credentialAccessLog.create({
      data: {
        tenantId,
        credentialId,
        action,
        accessedById: userId,
        accessedByName: userName,
        accessedByIp: ip,
        provider: String(provider),
        details,
      },
    });
  }

  async getAccessLogs(
    tenantId: string,
    filters: {
      credentialId?: string;
      action?: string;
      dateFrom?: Date;
      dateTo?: Date;
      page?: number;
      limit?: number;
    },
  ) {
    const where: any = { tenantId };
    if (filters.credentialId) where.credentialId = filters.credentialId;
    if (filters.action) where.action = filters.action;
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;

    const [data, total] = await Promise.all([
      this.prisma.credentialAccessLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.credentialAccessLog.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async resetDailyUsage(): Promise<void> {
    await this.prisma.tenantCredential.updateMany({
      data: { dailyUsageCount: 0 },
    });
  }
}
