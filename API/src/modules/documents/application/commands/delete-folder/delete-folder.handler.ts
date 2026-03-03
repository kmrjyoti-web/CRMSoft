import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteFolderCommand } from './delete-folder.command';
import { FolderService } from '../../../services/folder.service';

@CommandHandler(DeleteFolderCommand)
export class DeleteFolderHandler implements ICommandHandler<DeleteFolderCommand> {
  constructor(private readonly folderService: FolderService) {}

  async execute(command: DeleteFolderCommand) {
    await this.folderService.softDelete(command.id);
    return { success: true };
  }
}
