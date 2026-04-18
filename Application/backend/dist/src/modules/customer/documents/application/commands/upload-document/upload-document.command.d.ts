export declare class UploadDocumentCommand {
    readonly file: Express.Multer.File;
    readonly userId: string;
    readonly category?: string | undefined;
    readonly description?: string | undefined;
    readonly tags?: string[] | undefined;
    readonly folderId?: string | undefined;
    constructor(file: Express.Multer.File, userId: string, category?: string | undefined, description?: string | undefined, tags?: string[] | undefined, folderId?: string | undefined);
}
