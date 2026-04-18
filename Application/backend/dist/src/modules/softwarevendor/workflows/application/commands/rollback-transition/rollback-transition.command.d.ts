export declare class RollbackTransitionCommand {
    readonly instanceId: string;
    readonly userId: string;
    readonly comment?: string | undefined;
    constructor(instanceId: string, userId: string, comment?: string | undefined);
}
