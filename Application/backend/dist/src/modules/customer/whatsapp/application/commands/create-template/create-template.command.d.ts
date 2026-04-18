export declare class CreateTemplateCommand {
    readonly wabaId: string;
    readonly name: string;
    readonly language: string;
    readonly category: string;
    readonly headerType?: string | undefined;
    readonly headerContent?: string | undefined;
    readonly bodyText: string;
    readonly footerText?: string | undefined;
    readonly buttons?: Record<string, unknown> | undefined;
    readonly variables?: Record<string, unknown> | undefined;
    readonly sampleValues?: Record<string, unknown> | undefined;
    constructor(wabaId: string, name: string, language: string, category: string, headerType?: string | undefined, headerContent?: string | undefined, bodyText?: string, footerText?: string | undefined, buttons?: Record<string, unknown> | undefined, variables?: Record<string, unknown> | undefined, sampleValues?: Record<string, unknown> | undefined);
}
