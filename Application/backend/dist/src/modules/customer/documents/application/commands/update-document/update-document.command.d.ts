import { DocumentCategory } from '@prisma/working-client';
export declare class UpdateDocumentCommand {
    readonly id: string;
    readonly userId: string;
    readonly description?: string | undefined;
    readonly category?: DocumentCategory | undefined;
    readonly tags?: string[] | undefined;
    constructor(id: string, userId: string, description?: string | undefined, category?: DocumentCategory | undefined, tags?: string[] | undefined);
}
