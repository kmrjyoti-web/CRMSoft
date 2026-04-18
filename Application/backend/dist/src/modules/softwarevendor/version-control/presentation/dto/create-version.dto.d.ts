export declare class CreateVersionDto {
    version: string;
    releaseType: string;
    codeName?: string;
    changelog?: Record<string, unknown>[];
    breakingChanges?: string[];
    migrationNotes?: string;
    gitBranch?: string;
}
export declare class PublishVersionDto {
    gitTag?: string;
    gitCommitHash?: string;
}
export declare class RollbackVersionDto {
    rollbackReason: string;
}
export declare class CreatePatchDto {
    industryCode: string;
    patchName: string;
    description?: string;
    schemaChanges?: Record<string, unknown>;
    configOverrides?: Record<string, unknown>;
    menuOverrides?: Record<string, unknown>;
    forceUpdate?: boolean;
}
