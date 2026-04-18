import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { GetRoleQuery } from './get-role.query';
export declare class GetRoleHandler implements IQueryHandler<GetRoleQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetRoleQuery): Promise<any>;
}
