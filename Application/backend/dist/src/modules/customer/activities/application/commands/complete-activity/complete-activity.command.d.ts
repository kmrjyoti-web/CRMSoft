export declare class CompleteActivityCommand {
    readonly id: string;
    readonly userId: string;
    readonly outcome?: string | undefined;
    constructor(id: string, userId: string, outcome?: string | undefined);
}
