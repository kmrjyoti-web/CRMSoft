export declare class CreateVersionCommand {
    readonly version: string;
    readonly releaseType: string;
    readonly changelog: Record<string, unknown>[];
    readonly breakingChanges: Record<string, unknown>[];
    readonly migrationNotes: string | undefined;
    readonly codeName: string | undefined;
    readonly gitBranch: string | undefined;
    readonly createdBy: string;
    constructor(version: string, releaseType: string, changelog: Record<string, unknown>[], breakingChanges: Record<string, unknown>[], migrationNotes: string | undefined, codeName: string | undefined, gitBranch: string | undefined, createdBy: string);
}
