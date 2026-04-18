import { ConfigCategory } from '@prisma/identity-client';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ConfigSeederService } from './config-seeder.service';
export declare class TenantConfigService {
    private readonly prisma;
    private readonly seeder;
    private readonly cache;
    private readonly CACHE_TTL;
    constructor(prisma: PrismaService, seeder: ConfigSeederService);
    get(tenantId: string, key: string): Promise<string | null>;
    getInt(tenantId: string, key: string): Promise<number | null>;
    getDecimal(tenantId: string, key: string): Promise<number | null>;
    getBool(tenantId: string, key: string): Promise<boolean | null>;
    getJson(tenantId: string, key: string): Promise<any | null>;
    getByCategory(tenantId: string, category: ConfigCategory): Promise<Record<string, unknown[]>>;
    getAll(tenantId: string): Promise<Record<string, unknown[]>>;
    set(tenantId: string, key: string, value: string, userId: string, userName?: string): Promise<void>;
    bulkSet(tenantId: string, configs: {
        key: string;
        value: string;
    }[], userId: string, userName?: string): Promise<{
        updated: number;
    }>;
    resetToDefault(tenantId: string, key: string, userId: string): Promise<void>;
    seedDefaults(tenantId: string): Promise<{
        seeded: number;
    }>;
    private validateValue;
}
