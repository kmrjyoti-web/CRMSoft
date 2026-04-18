import { ProfileMatcherService } from './profile-matcher.service';
export declare class FieldMapperService {
    private readonly profileMatcher;
    constructor(profileMatcher: ProfileMatcherService);
    mapRows(rows: Record<string, string>[], fieldMapping: any[], defaults?: Record<string, any>): {
        mappedRows: Record<string, any>[];
        notesByRow: Map<number, string[]>;
    };
    private mapSingleRow;
    private splitName;
    private applyTransform;
}
