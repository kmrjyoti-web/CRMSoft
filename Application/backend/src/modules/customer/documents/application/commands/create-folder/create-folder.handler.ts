import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateFolderCommand } from './create-folder.command';
import { FolderService } from '../../../services/folder.service';

@CommandHandler(CreateFolderCommand)
export class CreateFolderHandler implements ICommandHandler<CreateFolderCommand> {
  constructor(private readonly folderService: FolderService) {}

  async execute(command: CreateFolderCommand) {
    return this.folderService.create({
      name: command.name,
      description: command.description,
      parentId: command.parentId,
      color: command.color,
      icon: command.icon,
      createdById: command.userId,
    });
  }
}
