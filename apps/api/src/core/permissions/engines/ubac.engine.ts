import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PermissionContext } from '../types/permission-context';

interface CachedUserOverrides {
  grants: string[];
  denies: string[];
  cachedAt: number;
}

/**
 * UBAC Engine — User-Based Access Control.
 * Per-user grant/deny overrides with expiry and wildcard support.
 */
@Injectable()
export class UbacEngine {
  private userCache = new Map<string, CachedUserOverrides>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(private readonly prisma: PrismaService) {}

  /** Check if user has an explicit DENY override. Step 1 in chain. */
  async hasExplicitDeny(ctx: PermissionContext): Promise<boolean> {
    const overrides = await this.getUserOverrides(ctx.userId);
    return overrides.denies.some((d) => this.matchesAction(ctx.action, d));
  }

  /** Check if user has an explicit GRANT override. Step 6 in chain. */
  async hasExplicitGrant(ctx: PermissionContext): Promise<boolean> {
    const overrides = await this.getUserOverrides(ctx.userId);
    return overrides.grants.some((g) => this.matchesAction(ctx.action, g));
  }

  /** Wildcard matching for overrides. */
  private matchesAction(action: string, override: string): boolean {
    if (override === '*') return true;
    if (override.endsWith(':*')) {
      return action.startsWith(override.slice(0, -1));
    }
    return action === override;
  }

  /** Load user overrides, filtering out expired ones. */
  async getUserOverrides(userId: string): Promise<{ grants: string[]; denies: string[] }> {
    const cached = this.userCache.get(userId);
    if (cached && Date.now() - cached.cachedAt < this.CACHE_TTL) {
      return { grants: cached.grants, denies: cached.denies };
    }

    const overrides = await this.prisma.identity.userPermissionOverride.findMany({
      where: {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    const grants = overrides.filter((o) => o.effect === 'grant').map((o) => o.action);
    const denies = overrides.filter((o) => o.effect === 'deny').map((o) => o.action);

    this.userCache.set(userId, { grants, denies, cachedAt: Date.now() });
    return { grants, denies };
  }

  invalidateUser(userId: string): void {
    this.userCache.delete(userId);
  }

  invalidateAll(): void {
    this.userCache.clear();
  }
}
