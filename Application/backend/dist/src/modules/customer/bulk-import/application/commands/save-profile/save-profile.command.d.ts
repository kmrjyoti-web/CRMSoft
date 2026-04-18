export declare class SaveProfileCommand {
    readonly jobId: string;
    readonly name: string;
    readonly description?: string | undefined;
    readonly sourceSystem?: string | undefined;
    constructor(jobId: string, name: string, description?: string | undefined, sourceSystem?: string | undefined);
}
