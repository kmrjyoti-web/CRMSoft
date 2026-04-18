import { PaginationDto } from '../../../../../common/dto/pagination.dto';
export declare class CreateTemplateDto {
    wabaId: string;
    name: string;
    language?: string;
    category: string;
    headerType?: string;
    headerContent?: string;
    bodyText: string;
    footerText?: string;
    buttons?: Record<string, unknown>;
    variables?: Record<string, unknown>;
    sampleValues?: Record<string, unknown>;
}
export declare class UpdateTemplateDto {
    name?: string;
    bodyText?: string;
    footerText?: string;
    buttons?: Record<string, unknown>;
}
export declare class TemplateQueryDto extends PaginationDto {
    wabaId: string;
    status?: string;
    category?: string;
}
