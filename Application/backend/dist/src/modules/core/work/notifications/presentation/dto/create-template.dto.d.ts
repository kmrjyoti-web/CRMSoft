export declare class CreateTemplateDto {
    name: string;
    category: string;
    subject: string;
    body: string;
    channels?: string[];
    variables?: string[];
}
export declare class UpdateTemplateDto {
    subject?: string;
    body?: string;
    channels?: string[];
    variables?: string[];
}
