export declare class PostRequirementCommand {
    readonly tenantId: string;
    readonly authorId: string;
    readonly title: string;
    readonly description?: string | undefined;
    readonly categoryId?: string | undefined;
    readonly quantity?: number | undefined;
    readonly targetPrice?: number | undefined;
    readonly currency?: string | undefined;
    readonly deadline?: Date | undefined;
    readonly mediaUrls?: string[] | undefined;
    readonly attributes?: Record<string, any> | undefined;
    readonly keywords?: string[] | undefined;
    constructor(tenantId: string, authorId: string, title: string, description?: string | undefined, categoryId?: string | undefined, quantity?: number | undefined, targetPrice?: number | undefined, currency?: string | undefined, deadline?: Date | undefined, mediaUrls?: string[] | undefined, attributes?: Record<string, any> | undefined, keywords?: string[] | undefined);
}
