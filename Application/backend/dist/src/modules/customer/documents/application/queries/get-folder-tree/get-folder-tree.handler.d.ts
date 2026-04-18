import { IQueryHandler } from '@nestjs/cqrs';
import { GetFolderTreeQuery } from './get-folder-tree.query';
import { FolderService } from '../../../services/folder.service';
export declare class GetFolderTreeHandler implements IQueryHandler<GetFolderTreeQuery> {
    private readonly folderService;
    private readonly logger;
    constructor(folderService: FolderService);
    execute(query: GetFolderTreeQuery): Promise<{
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
    }[]>;
}
