export declare class GetShareLinkQuery {
    readonly entityType: 'listing' | 'post' | 'offer';
    readonly entityId: string;
    readonly tenantId: string;
    constructor(entityType: 'listing' | 'post' | 'offer', entityId: string, tenantId: string);
}
