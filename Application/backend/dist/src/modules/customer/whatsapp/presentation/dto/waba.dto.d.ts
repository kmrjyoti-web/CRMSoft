export declare class SetupWabaDto {
    wabaId: string;
    phoneNumberId: string;
    phoneNumber: string;
    displayName: string;
    accessToken: string;
    webhookVerifyToken: string;
}
export declare class UpdateWabaDto {
    displayName?: string;
    accessToken?: string;
    settings?: Record<string, unknown>;
}
