import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetFolderContentsQuery } from './get-folder-contents.query';
import { FolderService } from '../../../services/folder.service';

@QueryHandler(GetFolderContentsQuery)
export class GetFolderContentsHandler implements IQueryHandler<GetFolderContentsQuery> {
    private readonly logger = new Logger(GetFolderContentsHandler.name);

  constructor(private readonly folderService: FolderService) {}

  async execute(query: GetFolderContentsQuery) {
    try {
      return this.folderService.getContents(query.folderId, query.page, query.limit);
    } catch (error) {
      this.logger.error(`GetFolderContentsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
