export declare class UpdateTemplateCommand {
    readonly id: string;
    readonly name?: string | undefined;
    readonly category?: string | undefined;
    readonly subject?: string | undefined;
    readonly bodyHtml?: string | undefined;
    readonly bodyText?: string | undefined;
    readonly variables?: Record<string, unknown>[] | undefined;
    readonly description?: string | undefined;
    readonly isShared?: boolean | undefined;
    constructor(id: string, name?: string | undefined, category?: string | undefined, subject?: string | undefined, bodyHtml?: string | undefined, bodyText?: string | undefined, variables?: Record<string, unknown>[] | undefined, description?: string | undefined, isShared?: boolean | undefined);
}
