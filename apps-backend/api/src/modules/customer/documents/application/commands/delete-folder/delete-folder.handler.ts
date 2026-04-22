import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DeleteFolderCommand } from './delete-folder.command';
import { FolderService } from '../../../services/folder.service';

@CommandHandler(DeleteFolderCommand)
export class DeleteFolderHandler implements ICommandHandler<DeleteFolderCommand> {
    private readonly logger = new Logger(DeleteFolderHandler.name);

  constructor(private readonly folderService: FolderService) {}

  async execute(command: DeleteFolderCommand) {
    try {
      await this.folderService.softDelete(command.id);
      return { success: true };
    } catch (error) {
      this.logger.error(`DeleteFolderHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
