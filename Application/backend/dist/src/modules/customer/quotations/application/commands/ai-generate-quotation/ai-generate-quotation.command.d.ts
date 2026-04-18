export declare class AiGenerateQuotationCommand {
    readonly leadId: string;
    readonly userId: string;
    readonly userName: string;
    readonly answers?: Record<string, any> | undefined;
    readonly templateId?: string | undefined;
    constructor(leadId: string, userId: string, userName: string, answers?: Record<string, any> | undefined, templateId?: string | undefined);
}
