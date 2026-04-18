import { IQueryHandler } from '@nestjs/cqrs';
import { GetRecurrenceByIdQuery } from './get-recurrence-by-id.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class GetRecurrenceByIdHandler implements IQueryHandler<GetRecurrenceByIdQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetRecurrenceByIdQuery): Promise<{
        createdBy: never;
    } & {
        id: string;
        tenantId: string;
        entityType: string;
        isActive: boolean;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        interval: number;
        entityId: string | null;
        pattern: import("@prisma/working-client").$Enums.RecurrencePattern;
        startDate: Date;
        endDate: Date | null;
        daysOfWeek: import("@prisma/working-client/runtime/library").JsonValue | null;
        templateData: import("@prisma/working-client/runtime/library").JsonValue;
        dayOfMonth: number | null;
        maxOccurrences: number | null;
        nextOccurrence: Date;
        lastGenerated: Date | null;
        occurrenceCount: number;
    }>;
}
