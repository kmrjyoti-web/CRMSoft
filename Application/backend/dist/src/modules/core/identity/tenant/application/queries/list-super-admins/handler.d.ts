import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { ListSuperAdminsQuery } from './query';
export declare class ListSuperAdminsHandler implements IQueryHandler<ListSuperAdminsQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(_query: ListSuperAdminsQuery): Promise<{
        id: string;
        isActive: boolean;
        firstName: string;
        lastName: string;
        email: string;
        lastLoginAt: Date | null;
    }[]>;
}
