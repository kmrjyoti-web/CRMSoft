export declare class UpdateTemplateCommand {
    readonly templateId: string;
    readonly name?: string | undefined;
    readonly bodyText?: string | undefined;
    readonly footerText?: string | undefined;
    readonly buttons?: Record<string, unknown> | undefined;
    constructor(templateId: string, name?: string | undefined, bodyText?: string | undefined, footerText?: string | undefined, buttons?: Record<string, unknown> | undefined);
}
