import { DocumentCategory } from '@prisma/working-client';

export class LinkCloudFileCommand {
  constructor(
    public readonly url: string,
    public readonly userId: string,
    public readonly category?: DocumentCategory,
    public readonly description?: string,
    public readonly tags?: string[],
    public readonly folderId?: string,
  ) {}
}
