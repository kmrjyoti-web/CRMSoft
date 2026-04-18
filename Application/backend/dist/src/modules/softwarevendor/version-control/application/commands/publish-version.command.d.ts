export declare class PublishVersionCommand {
    readonly versionId: string;
    readonly publishedBy: string;
    readonly gitTag: string | undefined;
    readonly gitCommitHash: string | undefined;
    constructor(versionId: string, publishedBy: string, gitTag: string | undefined, gitCommitHash: string | undefined);
}
