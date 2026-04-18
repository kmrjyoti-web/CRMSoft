export declare class RowActionDto {
    action: 'ACCEPT' | 'SKIP' | 'FORCE_CREATE';
}
export declare class RowBulkActionDto {
    action: 'ACCEPT_ALL_VALID' | 'SKIP_ALL_DUPLICATES' | 'SKIP_ALL_INVALID' | 'ACCEPT_ALL';
}
export declare class EditRowDto {
    editedData: Record<string, any>;
}
export declare class RowQueryDto {
    status?: string;
    page?: number;
    limit?: number;
}
