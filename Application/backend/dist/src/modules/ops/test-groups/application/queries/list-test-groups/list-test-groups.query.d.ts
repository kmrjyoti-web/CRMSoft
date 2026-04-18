export declare class ListTestGroupsQuery {
    readonly tenantId: string;
    readonly filters: {
        status?: string;
        module?: string;
    };
    constructor(tenantId: string, filters: {
        status?: string;
        module?: string;
    });
}
