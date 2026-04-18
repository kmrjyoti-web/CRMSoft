export declare class EngagePostCommand {
    readonly postId: string;
    readonly tenantId: string;
    readonly userId: string;
    readonly action: string;
    readonly sharedTo?: string | undefined;
    readonly city?: string | undefined;
    readonly state?: string | undefined;
    readonly deviceType?: string | undefined;
    constructor(postId: string, tenantId: string, userId: string, action: string, sharedTo?: string | undefined, city?: string | undefined, state?: string | undefined, deviceType?: string | undefined);
}
