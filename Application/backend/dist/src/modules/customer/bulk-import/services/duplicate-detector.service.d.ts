import { PrismaService } from '../../../../core/prisma/prisma.service';
import { FuzzyMatcherService } from './fuzzy-matcher.service';
export interface DuplicateResult {
    isDuplicate: boolean;
    duplicateType?: 'EXACT_DB' | 'FUZZY_DB' | 'IN_FILE';
    duplicateOfEntityId?: string;
    duplicateOfRowNumber?: number;
    duplicateMatchField?: string;
    duplicateMatchValue?: string;
    fuzzyMatchScore?: number;
    fuzzyMatchDetails?: Record<string, unknown>;
}
export declare class DuplicateDetectorService {
    private readonly prisma;
    private readonly fuzzyMatcher;
    constructor(prisma: PrismaService, fuzzyMatcher: FuzzyMatcherService);
    detectInFileDuplicates(rows: {
        rowNumber: number;
        mappedData: Record<string, any>;
    }[], checkFields: string[]): Map<number, DuplicateResult>;
    detectExactDbDuplicates(rows: {
        rowNumber: number;
        mappedData: Record<string, any>;
    }[], checkFields: string[], targetEntity: string): Promise<Map<number, DuplicateResult>>;
    detectFuzzyDbDuplicates(rows: {
        rowNumber: number;
        mappedData: Record<string, any>;
    }[], fuzzyFields: string[], targetEntity: string, threshold: number): Promise<Map<number, DuplicateResult>>;
    private extractField;
    private extractFuzzyField;
    private queryDbForField;
    private loadFuzzyCandidates;
}
