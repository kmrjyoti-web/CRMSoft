export declare class UpdateWabaCommand {
    readonly id: string;
    readonly displayName?: string | undefined;
    readonly accessToken?: string | undefined;
    readonly settings?: Record<string, unknown> | undefined;
    constructor(id: string, displayName?: string | undefined, accessToken?: string | undefined, settings?: Record<string, unknown> | undefined);
}
