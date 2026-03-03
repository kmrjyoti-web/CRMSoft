import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateFolderCommand } from './update-folder.command';
import { FolderService } from '../../../services/folder.service';

@CommandHandler(UpdateFolderCommand)
export class UpdateFolderHandler implements ICommandHandler<UpdateFolderCommand> {
  constructor(private readonly folderService: FolderService) {}

  async execute(command: UpdateFolderCommand) {
    return this.folderService.update(command.id, {
      name: command.name,
      description: command.description,
      color: command.color,
      icon: command.icon,
    });
  }
}
