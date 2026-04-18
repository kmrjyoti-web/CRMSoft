export declare class InitiateVerificationDto {
    entityType: string;
    entityId: string;
    mode: string;
    channel: string;
}
export declare class VerifyOtpDto {
    recordId: string;
    otp: string;
}
export declare class RejectVerificationDto {
    reason?: string;
}
