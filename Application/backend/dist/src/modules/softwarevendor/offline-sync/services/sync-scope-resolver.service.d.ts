import { PrismaService } from '../../../../core/prisma/prisma.service';
import { EntityResolverService } from './entity-resolver.service';
export declare class SyncScopeResolverService {
    private readonly prisma;
    private readonly entityResolver;
    constructor(prisma: PrismaService, entityResolver: EntityResolverService);
    resolveScope(userId: string, entityName: string, downloadScope: string): Promise<Record<string, any>>;
    private buildOwnedScope;
    private buildTeamScope;
}
