export declare class EditRowCommand {
    readonly jobId: string;
    readonly rowId: string;
    readonly editedData: Record<string, any>;
    constructor(jobId: string, rowId: string, editedData: Record<string, any>);
}
