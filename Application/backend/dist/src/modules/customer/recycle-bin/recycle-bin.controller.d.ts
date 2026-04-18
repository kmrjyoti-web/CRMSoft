import { PrismaService } from '../../../core/prisma/prisma.service';
import { ApiResponse } from '../../../common/utils/api-response';
interface RecycleBinItem {
    id: string;
    entityType: string;
    name: string;
    subtitle?: string;
    deletedAt: string | null;
    deletedBy?: string;
}
export declare class RecycleBinController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getAll(entityType?: string, limit?: string): Promise<ApiResponse<RecycleBinItem[]>>;
}
export {};
