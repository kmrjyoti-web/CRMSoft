export declare class UnfollowUserCommand {
    readonly tenantId: string;
    readonly followerId: string;
    readonly followingId: string;
    constructor(tenantId: string, followerId: string, followingId: string);
}
