import { PrismaService } from '../../../../core/prisma/prisma.service';
export interface ImportRowResult {
    rowNumber: number;
    success: boolean;
    action?: 'CREATED' | 'UPDATED' | 'SKIPPED' | 'FAILED';
    entityId?: string;
    error?: string;
}
export declare class ImportExecutorService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    executeRow(row: {
        rowNumber: number;
        mappedData: Record<string, any>;
        userAction?: string;
        duplicateOfEntityId?: string;
    }, targetEntity: string, createdById: string): Promise<ImportRowResult>;
    private createEntity;
    private updateEntity;
    private createContact;
    private createOrganization;
    private createLead;
    private createProduct;
    private createLedger;
    private filterEmptyValues;
}
