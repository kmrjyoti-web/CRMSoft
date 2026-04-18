export declare class UploadVersionCommand {
    readonly parentDocumentId: string;
    readonly file: Express.Multer.File;
    readonly userId: string;
    constructor(parentDocumentId: string, file: Express.Multer.File, userId: string);
}
