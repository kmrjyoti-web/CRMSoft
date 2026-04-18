export declare class UpdateNotionConfigDto {
    token?: string;
    databaseId?: string;
}
export declare class CreateNotionEntryDto {
    promptNumber: string;
    title: string;
    description?: string;
    status: string;
    filesChanged?: string;
    testResults?: string;
}
