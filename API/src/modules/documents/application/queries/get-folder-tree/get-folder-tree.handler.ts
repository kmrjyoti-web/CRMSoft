import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetFolderTreeQuery } from './get-folder-tree.query';
import { FolderService } from '../../../services/folder.service';

@QueryHandler(GetFolderTreeQuery)
export class GetFolderTreeHandler implements IQueryHandler<GetFolderTreeQuery> {
  constructor(private readonly folderService: FolderService) {}

  async execute(query: GetFolderTreeQuery) {
    return this.folderService.getTree(query.userId);
  }
}
