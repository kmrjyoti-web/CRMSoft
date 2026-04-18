import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { ListPermissionsQuery } from './list-permissions.query';
export declare class ListPermissionsHandler implements IQueryHandler<ListPermissionsQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: ListPermissionsQuery): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        action: string;
        module: string;
    }[]>;
}
