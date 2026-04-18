export declare class UploadFileCommand {
    readonly fileName: string;
    readonly fileType: string;
    readonly fileSize: number;
    readonly buffer: Buffer;
    readonly targetEntity: string;
    readonly createdById: string;
    readonly createdByName: string;
    constructor(fileName: string, fileType: string, fileSize: number, buffer: Buffer, targetEntity: string, createdById: string, createdByName: string);
}
