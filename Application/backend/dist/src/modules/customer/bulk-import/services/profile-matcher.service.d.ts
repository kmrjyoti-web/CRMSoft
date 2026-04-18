import { PrismaService } from '../../../../core/prisma/prisma.service';
export interface MatchResult {
    profileId: string;
    profileName: string;
    matchScore: number;
    status: 'FULL_MATCH' | 'PARTIAL' | 'NO_MATCH';
    resolvedMapping: any[];
    unmatchedHeaders: string[];
    matchedCount: number;
    totalExpected: number;
}
export declare class ProfileMatcherService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    matchHeaders(fileHeaders: string[], profile: any): MatchResult;
    suggestProfiles(fileHeaders: string[], targetEntity: string): Promise<MatchResult[]>;
    applyMapping(rowData: Record<string, string>, resolvedMapping: any[], defaults?: any): Record<string, any>;
    private applyTransform;
}
