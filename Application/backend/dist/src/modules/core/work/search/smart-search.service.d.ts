import { PrismaService } from '../../../../core/prisma/prisma.service';
import { SmartSearchDto } from './dto/smart-search.dto';
export declare class SmartSearchService {
    private prisma;
    constructor(prisma: PrismaService);
    search(tenantId: string, query: SmartSearchDto): Promise<{
        results: any[];
        total: number;
        limit: number;
        offset: number;
    }>;
    getParameterConfig(entityType: string): unknown[];
    private getFieldName;
    private getSelectFields;
}
