export declare class RowBulkActionCommand {
    readonly jobId: string;
    readonly action: 'ACCEPT_ALL_VALID' | 'SKIP_ALL_DUPLICATES' | 'SKIP_ALL_INVALID' | 'ACCEPT_ALL';
    constructor(jobId: string, action: 'ACCEPT_ALL_VALID' | 'SKIP_ALL_DUPLICATES' | 'SKIP_ALL_INVALID' | 'ACCEPT_ALL');
}
