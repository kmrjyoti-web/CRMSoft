export declare class CreateTemplateCommand {
    readonly name: string;
    readonly category: string;
    readonly subject: string;
    readonly bodyHtml: string;
    readonly isShared: boolean;
    readonly userId: string;
    readonly userName: string;
    readonly bodyText?: string | undefined;
    readonly variables?: Record<string, unknown>[] | undefined;
    readonly description?: string | undefined;
    constructor(name: string, category: string, subject: string, bodyHtml: string, isShared: boolean, userId: string, userName: string, bodyText?: string | undefined, variables?: Record<string, unknown>[] | undefined, description?: string | undefined);
}
