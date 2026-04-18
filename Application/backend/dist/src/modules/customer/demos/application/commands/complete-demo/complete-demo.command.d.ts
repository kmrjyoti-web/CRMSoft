export declare class CompleteDemoCommand {
    readonly id: string;
    readonly userId: string;
    readonly result: string;
    readonly outcome?: string | undefined;
    readonly notes?: string | undefined;
    constructor(id: string, userId: string, result: string, outcome?: string | undefined, notes?: string | undefined);
}
