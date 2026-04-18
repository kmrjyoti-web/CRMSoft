import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { GetUserQuery } from './get-user.query';
export declare class GetUserHandler implements IQueryHandler<GetUserQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetUserQuery): Promise<any>;
}
