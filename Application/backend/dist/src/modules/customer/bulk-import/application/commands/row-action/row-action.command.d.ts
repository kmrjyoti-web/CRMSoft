export declare class RowActionCommand {
    readonly jobId: string;
    readonly rowId: string;
    readonly action: 'ACCEPT' | 'SKIP' | 'FORCE_CREATE';
    constructor(jobId: string, rowId: string, action: 'ACCEPT' | 'SKIP' | 'FORCE_CREATE');
}
