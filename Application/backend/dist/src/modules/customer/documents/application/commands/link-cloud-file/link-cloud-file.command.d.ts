import { DocumentCategory } from '@prisma/working-client';
export declare class LinkCloudFileCommand {
    readonly url: string;
    readonly userId: string;
    readonly category?: DocumentCategory | undefined;
    readonly description?: string | undefined;
    readonly tags?: string[] | undefined;
    readonly folderId?: string | undefined;
    constructor(url: string, userId: string, category?: DocumentCategory | undefined, description?: string | undefined, tags?: string[] | undefined, folderId?: string | undefined);
}
