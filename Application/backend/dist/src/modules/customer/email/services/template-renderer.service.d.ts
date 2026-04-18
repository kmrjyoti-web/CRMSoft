import { PrismaService } from '../../../../core/prisma/prisma.service';
export interface VariableInfo {
    name: string;
    required: boolean;
    defaultValue?: string;
}
export declare class TemplateRendererService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    render(template: string, data: Record<string, any>): string;
    extractVariables(template: string): VariableInfo[];
    preview(templateId: string, sampleData?: Record<string, any>): Promise<{
        subject: string;
        bodyHtml: string;
        bodyText: string | null;
        usedVariables: VariableInfo[];
    }>;
    private resolveValue;
}
