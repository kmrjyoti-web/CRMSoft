import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaClient as WorkingClient } from '@prisma/working-client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { createSoftDeleteMiddleware } from '../../core/prisma/soft-delete.middleware';

const MAX_POOL_SIZE = parseInt(process.env.TENANT_DB_POOL_MAX ?? '50', 10);
const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 min
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000; // 10 min

interface PoolEntry {
  client: WorkingClient;
  lastUsedAt: Date;
  connecting: boolean;
}

@Injectable()
export class PrismaClientFactory implements OnModuleDestroy {
  private readonly logger = new Logger(PrismaClientFactory.name);
  private readonly pool = new Map<string, PoolEntry>();
  private readonly encKey: Buffer;

  constructor(private readonly prisma: PrismaService) {
    const master = process.env.ENCRYPTION_MASTER_KEY;
    this.encKey = master
      ? crypto.scryptSync(master, 'tenant-db-connection-salt', 32)
      : crypto.randomBytes(32); // dev fallback — won't decrypt stored connections

    if (!master) {
      this.logger.warn(
        'ENCRYPTION_MASTER_KEY not set — dedicated tenant DB connections cannot be decrypted.',
      );
    }

    setInterval(() => this.evictIdle(), CLEANUP_INTERVAL_MS).unref();
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  /**
   * Returns the correct WorkingDB client for a tenant.
   * SHARED strategy → global shared client.
   * DEDICATED strategy → per-tenant pool client (lazy-connected, cached 30min).
   */
  async getClient(tenantId: string): Promise<WorkingClient> {
    const tenant = await this.prisma.identity.tenant.findUnique({
      where: { id: tenantId },
      select: {
        dbStrategy: true,
        dbConnectionEncrypted: true,
        dbConnectionIv: true,
        dbConnectionTag: true,
      } as any,
    }).catch(() => null) as any;

    if (!tenant) {
      this.logger.warn(`Tenant ${tenantId} not found — falling back to shared DB`);
      return this.prisma.working;
    }

    const strategy: string = tenant.dbStrategy ?? 'SHARED';

    if (strategy !== 'DEDICATED') {
      return this.prisma.working;
    }

    if (!tenant.dbConnectionEncrypted || !tenant.dbConnectionIv || !tenant.dbConnectionTag) {
      this.logger.warn(
        `Tenant ${tenantId} has DEDICATED strategy but missing encrypted connection — fallback to shared DB`,
      );
      return this.prisma.working;
    }

    return this.getOrCreateDedicatedClient(tenantId, {
      encrypted: tenant.dbConnectionEncrypted,
      iv: tenant.dbConnectionIv,
      tag: tenant.dbConnectionTag,
    });
  }

  disconnectClient(tenantId: string): Promise<void> {
    const entry = this.pool.get(tenantId);
    if (!entry) return Promise.resolve();
    this.pool.delete(tenantId);
    return entry.client.$disconnect().catch((err: Error) =>
      this.logger.warn(`Error disconnecting tenant ${tenantId}: ${err.message}`),
    );
  }

  getPoolStats(): { totalClients: number; activeClients: number; idleClients: number } {
    const now = Date.now();
    let idle = 0;
    for (const entry of this.pool.values()) {
      if (now - entry.lastUsedAt.getTime() > IDLE_TIMEOUT_MS) idle++;
    }
    return { totalClients: this.pool.size, activeClients: this.pool.size - idle, idleClients: idle };
  }

  async onModuleDestroy() {
    for (const [tenantId, entry] of this.pool.entries()) {
      await entry.client.$disconnect().catch(() => null);
      this.logger.log(`Disconnected dedicated client for tenant ${tenantId}`);
    }
    this.pool.clear();
  }

  // ─── Connection string encryption helpers (used by WlDbProvisioningService) ─

  encryptConnectionString(connectionString: string): {
    encrypted: string;
    iv: string;
    tag: string;
  } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encKey, iv);
    const ciphertext = Buffer.concat([
      cipher.update(connectionString, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    return {
      encrypted: ciphertext.toString('hex'),
      iv: iv.toString('hex'),
      tag: authTag.toString('hex'),
    };
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async getOrCreateDedicatedClient(
    tenantId: string,
    creds: { encrypted: string; iv: string; tag: string },
  ): Promise<WorkingClient> {
    const existing = this.pool.get(tenantId);
    if (existing && !existing.connecting) {
      existing.lastUsedAt = new Date();
      return existing.client;
    }

    // Evict oldest idle client if pool is full
    if (this.pool.size >= MAX_POOL_SIZE) {
      this.evictOldestIdle();
    }

    let connectionUrl: string;
    try {
      connectionUrl = this.decryptConnectionString(creds);
    } catch (err: any) {
      this.logger.error(`Failed to decrypt connection for tenant ${tenantId} — falling back to shared DB`);
      return this.prisma.working;
    }

    const entry: PoolEntry = {
      client: null as any,
      lastUsedAt: new Date(),
      connecting: true,
    };
    this.pool.set(tenantId, entry);

    try {
      const client = new WorkingClient({
        datasources: { db: { url: connectionUrl } },
        log: process.env.NODE_ENV === 'production' ? ['error'] : ['warn', 'error'],
      });
      (client as any).$use(createSoftDeleteMiddleware());
      await client.$connect();
      entry.client = client;
      entry.connecting = false;
      this.logger.log(`Dedicated DB connected for tenant ${tenantId}`);
      return client;
    } catch (err: any) {
      this.pool.delete(tenantId);
      this.logger.error(
        `Failed to connect dedicated DB for tenant ${tenantId}: ${err.message} — falling back to shared DB`,
      );
      return this.prisma.working;
    }
  }

  private decryptConnectionString(creds: { encrypted: string; iv: string; tag: string }): string {
    const iv = Buffer.from(creds.iv, 'hex');
    const tag = Buffer.from(creds.tag, 'hex');
    const ciphertext = Buffer.from(creds.encrypted, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', this.encKey, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
  }

  private evictIdle() {
    const cutoff = Date.now() - IDLE_TIMEOUT_MS;
    for (const [tenantId, entry] of this.pool.entries()) {
      if (!entry.connecting && entry.lastUsedAt.getTime() < cutoff) {
        this.pool.delete(tenantId);
        entry.client.$disconnect().catch(() => null);
        this.logger.log(`Evicted idle dedicated client for tenant ${tenantId}`);
      }
    }
  }

  private evictOldestIdle() {
    let oldestId: string | null = null;
    let oldestTime = Infinity;
    for (const [tenantId, entry] of this.pool.entries()) {
      if (!entry.connecting && entry.lastUsedAt.getTime() < oldestTime) {
        oldestTime = entry.lastUsedAt.getTime();
        oldestId = tenantId;
      }
    }
    if (oldestId) {
      const evicted = this.pool.get(oldestId)!;
      this.pool.delete(oldestId);
      evicted.client.$disconnect().catch(() => null);
      this.logger.log(`Pool full — evicted oldest idle client for tenant ${oldestId}`);
    }
  }
}
