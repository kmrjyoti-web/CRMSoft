import { QueryBus } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { ApiResponse } from '../../../../../common/utils/api-response';
export declare class PermissionsController {
    private readonly queryBus;
    private readonly prisma;
    constructor(queryBus: QueryBus, prisma: PrismaService);
    findAll(module?: string, search?: string): Promise<ApiResponse<any>>;
    getMatrix(req: any): Promise<ApiResponse<Record<string, string[]>>>;
}
