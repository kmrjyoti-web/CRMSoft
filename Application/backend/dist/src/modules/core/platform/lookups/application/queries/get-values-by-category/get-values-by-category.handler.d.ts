import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { GetValuesByCategoryQuery } from './get-values-by-category.query';
export declare class GetValuesByCategoryHandler implements IQueryHandler<GetValuesByCategoryQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetValuesByCategoryQuery): Promise<{
        lookupId: string;
        category: string;
        displayName: string;
        values: {
            id: string;
            isDefault: boolean;
            configJson: import("@prisma/platform-client/runtime/library").JsonValue;
            color: string | null;
            icon: string | null;
            value: string;
            label: string;
            parentId: string | null;
            rowIndex: number;
        }[];
    }>;
}
