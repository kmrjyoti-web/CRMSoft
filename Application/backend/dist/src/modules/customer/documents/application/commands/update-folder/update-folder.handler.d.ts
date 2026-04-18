import { ICommandHandler } from '@nestjs/cqrs';
import { UpdateFolderCommand } from './update-folder.command';
import { FolderService } from '../../../services/folder.service';
export declare class UpdateFolderHandler implements ICommandHandler<UpdateFolderCommand> {
    private readonly folderService;
    private readonly logger;
    constructor(folderService: FolderService);
    execute(command: UpdateFolderCommand): Promise<{
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        color: string | null;
        icon: string | null;
        sortOrder: number;
        parentId: string | null;
    }>;
}
