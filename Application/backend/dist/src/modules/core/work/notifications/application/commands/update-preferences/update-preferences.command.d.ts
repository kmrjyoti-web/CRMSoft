export declare class UpdatePreferencesCommand {
    readonly userId: string;
    readonly channels?: Record<string, unknown> | undefined;
    readonly categories?: Record<string, unknown> | undefined;
    readonly quietHoursStart?: string | undefined;
    readonly quietHoursEnd?: string | undefined;
    readonly digestFrequency?: string | undefined;
    readonly timezone?: string | undefined;
    constructor(userId: string, channels?: Record<string, unknown> | undefined, categories?: Record<string, unknown> | undefined, quietHoursStart?: string | undefined, quietHoursEnd?: string | undefined, digestFrequency?: string | undefined, timezone?: string | undefined);
}
