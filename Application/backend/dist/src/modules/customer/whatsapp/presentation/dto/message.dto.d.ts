export declare class SendTextMessageDto {
    wabaId: string;
    text: string;
}
export declare class SendTemplateMessageDto {
    wabaId: string;
    templateId: string;
    variables?: Record<string, unknown>;
}
export declare class SendMediaMessageDto {
    wabaId: string;
    type: string;
    mediaUrl: string;
    caption?: string;
}
export declare class SendInteractiveMessageDto {
    wabaId: string;
    interactiveType: string;
    interactiveData: Record<string, unknown>;
}
export declare class SendLocationMessageDto {
    wabaId: string;
    lat: number;
    lng: number;
    name?: string;
    address?: string;
}
