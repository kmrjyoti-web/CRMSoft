import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { AutoNumberSequence } from '@prisma/working-client';
export declare class AutoNumberService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    next(tenantId: string, entityName: string): Promise<string>;
    preview(tenantId: string, entityName: string): Promise<string>;
    resetSequence(tenantId: string, entityName: string, newStart?: number): Promise<void>;
    autoResetAll(tenantId: string): Promise<{
        reset: string[];
        skipped: string[];
    }>;
    getAll(tenantId: string): Promise<AutoNumberSequence[]>;
    getOne(tenantId: string, entityName: string): Promise<AutoNumberSequence>;
    update(tenantId: string, entityName: string, data: Partial<AutoNumberSequence>): Promise<AutoNumberSequence>;
    format(pattern: string, prefix: string, seq: number, defaultPad: number): string;
    private shouldReset;
    private findSequence;
}
