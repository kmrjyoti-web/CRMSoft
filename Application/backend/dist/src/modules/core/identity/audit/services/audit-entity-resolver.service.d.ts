export interface ResolvedEntity {
    entityType: string;
    entityId: string | null;
    action: string;
    module: string;
}
export declare class AuditEntityResolverService {
    private readonly ROUTE_MAP;
    private readonly STATUS_ACTION_KEYWORDS;
    resolve(url: string, params: Record<string, string>, method: string): ResolvedEntity | null;
    private determineAction;
}
