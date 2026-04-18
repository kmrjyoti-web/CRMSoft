export declare class CreateBroadcastCommand {
    readonly wabaId: string;
    readonly name: string;
    readonly templateId: string;
    readonly scheduledAt?: Date | undefined;
    readonly throttlePerSecond?: number | undefined;
    readonly userId: string;
    readonly userName: string;
    constructor(wabaId: string, name: string, templateId: string, scheduledAt?: Date | undefined, throttlePerSecond?: number | undefined, userId?: string, userName?: string);
}
