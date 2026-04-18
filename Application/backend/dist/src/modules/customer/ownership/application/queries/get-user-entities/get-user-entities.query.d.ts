export declare class GetUserEntitiesQuery {
    readonly userId: string;
    readonly entityType?: string | undefined;
    readonly ownerType?: string | undefined;
    readonly isActive?: boolean | undefined;
    constructor(userId: string, entityType?: string | undefined, ownerType?: string | undefined, isActive?: boolean | undefined);
}
