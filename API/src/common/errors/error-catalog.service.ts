import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

export interface CatalogEntry {
  code: string;
  layer: string;
  module: string;
  severity: string;
  httpStatus: number;
  messageEn: string;
  messageHi: string | null;
  solutionEn: string | null;
  solutionHi: string | null;
  technicalInfo: string | null;
  helpUrl: string | null;
  isRetryable: boolean;
  retryAfterMs: number | null;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * In-memory cached lookup for the ErrorCatalog table.
 * Loads all active entries on startup and refreshes every 5 minutes.
 */
@Injectable()
export class ErrorCatalogService implements OnModuleInit {
  private readonly logger = new Logger('ErrorCatalog');
  private cache = new Map<string, CatalogEntry>();
  private lastRefresh = 0;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await this.refreshCache();
  }

  /** Get a single catalog entry by error code. */
  async getByCode(code: string): Promise<CatalogEntry | null> {
    await this.ensureFresh();
    return this.cache.get(code) ?? null;
  }

  /** Get all catalog entries. */
  async getAll(): Promise<CatalogEntry[]> {
    await this.ensureFresh();
    return Array.from(this.cache.values());
  }

  /** Get catalog entries filtered by module name. */
  async getByModule(moduleName: string): Promise<CatalogEntry[]> {
    await this.ensureFresh();
    return Array.from(this.cache.values()).filter(
      (e) => e.module.toLowerCase() === moduleName.toLowerCase(),
    );
  }

  /** Get catalog entries filtered by layer. */
  async getByLayer(layer: string): Promise<CatalogEntry[]> {
    await this.ensureFresh();
    return Array.from(this.cache.values()).filter((e) => e.layer === layer);
  }

  /** Force refresh cache from DB. */
  async refreshCache(): Promise<number> {
    try {
      const entries = await this.prisma.errorCatalog.findMany({
        where: { isActive: true },
      });
      this.cache.clear();
      for (const e of entries) {
        this.cache.set(e.code, {
          code: e.code,
          layer: e.layer,
          module: e.module,
          severity: e.severity,
          httpStatus: e.httpStatus,
          messageEn: e.messageEn,
          messageHi: e.messageHi,
          solutionEn: e.solutionEn,
          solutionHi: e.solutionHi,
          technicalInfo: e.technicalInfo,
          helpUrl: e.helpUrl,
          isRetryable: e.isRetryable,
          retryAfterMs: e.retryAfterMs,
        });
      }
      this.lastRefresh = Date.now();
      this.logger.log(`Cache refreshed: ${this.cache.size} entries`);
      return this.cache.size;
    } catch (err) {
      this.logger.warn(`Cache refresh failed: ${err.message}`);
      return this.cache.size;
    }
  }

  /** Check if cache is stale and refresh if needed. */
  private async ensureFresh(): Promise<void> {
    if (Date.now() - this.lastRefresh > CACHE_TTL_MS) {
      await this.refreshCache();
    }
  }
}
