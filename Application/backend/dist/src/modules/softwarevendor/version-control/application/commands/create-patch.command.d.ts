export declare class CreatePatchCommand {
    readonly versionId: string;
    readonly industryCode: string;
    readonly patchName: string;
    readonly description: string | undefined;
    readonly schemaChanges: Record<string, unknown>;
    readonly configOverrides: Record<string, unknown>;
    readonly menuOverrides: any;
    readonly forceUpdate: boolean;
    readonly createdBy: string;
    constructor(versionId: string, industryCode: string, patchName: string, description: string | undefined, schemaChanges: Record<string, unknown>, configOverrides: Record<string, unknown>, menuOverrides: any, forceUpdate: boolean, createdBy: string);
}
