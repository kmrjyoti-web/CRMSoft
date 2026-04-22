import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CreateFolderCommand } from './create-folder.command';
import { FolderService } from '../../../services/folder.service';

@CommandHandler(CreateFolderCommand)
export class CreateFolderHandler implements ICommandHandler<CreateFolderCommand> {
    private readonly logger = new Logger(CreateFolderHandler.name);

  constructor(private readonly folderService: FolderService) {}

  async execute(command: CreateFolderCommand) {
    try {
      return this.folderService.create({
        name: command.name,
        description: command.description,
        parentId: command.parentId,
        color: command.color,
        icon: command.icon,
        createdById: command.userId,
      });
    } catch (error) {
      this.logger.error(`CreateFolderHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
