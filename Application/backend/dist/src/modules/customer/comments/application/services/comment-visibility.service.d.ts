import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { Prisma } from '@prisma/working-client';
interface UserContext {
    userId: string;
    roleLevel: number;
}
export declare class CommentVisibilityService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    validateCanMarkPrivate(roleLevel: number): void;
    buildVisibilityFilter(ctx: UserContext): Promise<Prisma.CommentWhereInput>;
    private getReporteeIds;
}
export {};
