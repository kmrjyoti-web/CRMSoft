export declare class CancelDemoCommand {
    readonly id: string;
    readonly userId: string;
    readonly reason: string;
    readonly isNoShow?: boolean | undefined;
    constructor(id: string, userId: string, reason: string, isNoShow?: boolean | undefined);
}
