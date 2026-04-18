export declare class RegisterPushCommand {
    readonly userId: string;
    readonly endpoint: string;
    readonly p256dh?: string | undefined;
    readonly auth?: string | undefined;
    readonly deviceType?: string | undefined;
    constructor(userId: string, endpoint: string, p256dh?: string | undefined, auth?: string | undefined, deviceType?: string | undefined);
}
