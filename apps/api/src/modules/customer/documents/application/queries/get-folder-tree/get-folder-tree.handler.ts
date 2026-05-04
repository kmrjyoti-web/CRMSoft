import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetFolderTreeQuery } from './get-folder-tree.query';
import { FolderService } from '../../../services/folder.service';

@QueryHandler(GetFolderTreeQuery)
export class GetFolderTreeHandler implements IQueryHandler<GetFolderTreeQuery> {
    private readonly logger = new Logger(GetFolderTreeHandler.name);

  constructor(private readonly folderService: FolderService) {}

  async execute(query: GetFolderTreeQuery) {
    try {
      return this.folderService.getTree(query.userId);
    } catch (error) {
      this.logger.error(`GetFolderTreeHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
