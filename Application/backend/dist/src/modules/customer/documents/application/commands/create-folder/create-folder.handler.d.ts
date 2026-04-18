import { ICommandHandler } from '@nestjs/cqrs';
import { CreateFolderCommand } from './create-folder.command';
import { FolderService } from '../../../services/folder.service';
export declare class CreateFolderHandler implements ICommandHandler<CreateFolderCommand> {
    private readonly folderService;
    private readonly logger;
    constructor(folderService: FolderService);
    execute(command: CreateFolderCommand): Promise<{
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
