import { PrismaService } from '../../../../core/prisma/prisma.service';
export interface EntityConfig {
    delegateName: string;
    ownerFields: string[];
    softDeleteField: string | null;
    terminalStatuses: string[];
    syncInclude: Record<string, boolean> | null;
    excludeFields: string[];
}
export declare class EntityResolverService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getEntityConfig(entityName: string): EntityConfig;
    getDelegate(entityName: string): any;
    getSupportedEntities(): string[];
    isSupported(entityName: string): boolean;
}
