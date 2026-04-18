import { ICommandHandler } from '@nestjs/cqrs';
import { DeleteFolderCommand } from './delete-folder.command';
import { FolderService } from '../../../services/folder.service';
export declare class DeleteFolderHandler implements ICommandHandler<DeleteFolderCommand> {
    private readonly folderService;
    private readonly logger;
    constructor(folderService: FolderService);
    execute(command: DeleteFolderCommand): Promise<{
        success: boolean;
    }>;
}
