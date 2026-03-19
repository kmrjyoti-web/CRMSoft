import { DocumentCategory } from '@prisma/client';

export class UpdateDocumentCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly description?: string,
    public readonly category?: DocumentCategory,
    public readonly tags?: string[],
  ) {}
}
