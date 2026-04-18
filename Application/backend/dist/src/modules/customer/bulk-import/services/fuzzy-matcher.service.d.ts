export interface FieldScore {
    field: string;
    importValue: string;
    dbValue: string;
    similarity: number;
}
export interface CombinedScore {
    score: number;
    confidence: 'EXACT' | 'HIGH' | 'MEDIUM' | 'LOW';
    fieldScores: FieldScore[];
    matchReason: string;
}
export declare class FuzzyMatcherService {
    levenshteinDistance(a: string, b: string): number;
    levenshteinSimilarity(a: string, b: string): number;
    nameSimilarity(a: string, b: string): number;
    companySimilarity(a: string, b: string): number;
    phonePartialMatch(a: string, b: string, lastN?: number): boolean;
    combinedScore(fieldScores: FieldScore[]): CombinedScore;
}
