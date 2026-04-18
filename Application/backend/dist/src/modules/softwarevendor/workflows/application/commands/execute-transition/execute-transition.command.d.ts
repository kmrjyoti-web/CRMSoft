export declare class ExecuteTransitionCommand {
    readonly instanceId: string;
    readonly transitionCode: string;
    readonly userId: string;
    readonly comment?: string | undefined;
    readonly data?: Record<string, any> | undefined;
    constructor(instanceId: string, transitionCode: string, userId: string, comment?: string | undefined, data?: Record<string, any> | undefined);
}
