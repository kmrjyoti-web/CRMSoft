import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetFolderContentsQuery } from './get-folder-contents.query';
import { FolderService } from '../../../services/folder.service';

@QueryHandler(GetFolderContentsQuery)
export class GetFolderContentsHandler implements IQueryHandler<GetFolderContentsQuery> {
  constructor(private readonly folderService: FolderService) {}

  async execute(query: GetFolderContentsQuery) {
    return this.folderService.getContents(query.folderId, query.page, query.limit);
  }
}
