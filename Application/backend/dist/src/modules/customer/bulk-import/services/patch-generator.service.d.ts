import { PrismaService } from '../../../../core/prisma/prisma.service';
export interface PatchField {
    field: string;
    oldValue: string | null;
    newValue: string | null;
    action: 'ADD' | 'UPDATE' | 'NO_CHANGE';
    recommendation: string;
}
export interface PatchPreview {
    entityId: string;
    entityLabel: string;
    fields: PatchField[];
    hasChanges: boolean;
    summary: string;
}
export declare class PatchGeneratorService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    generatePatch(entityId: string, mappedData: Record<string, any>, targetEntity: string): Promise<PatchPreview>;
    generatePatchesForRows(rows: {
        rowNumber: number;
        mappedData: Record<string, any>;
        entityId: string;
    }[], targetEntity: string): Promise<Map<number, PatchPreview>>;
    private loadEntity;
    private getLabel;
}
