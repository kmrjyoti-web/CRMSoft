import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { UpdateFolderCommand } from './update-folder.command';
import { FolderService } from '../../../services/folder.service';

@CommandHandler(UpdateFolderCommand)
export class UpdateFolderHandler implements ICommandHandler<UpdateFolderCommand> {
    private readonly logger = new Logger(UpdateFolderHandler.name);

  constructor(private readonly folderService: FolderService) {}

  async execute(command: UpdateFolderCommand) {
    try {
      return this.folderService.update(command.id, {
        name: command.name,
        description: command.description,
        color: command.color,
        icon: command.icon,
      });
    } catch (error) {
      this.logger.error(`UpdateFolderHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
