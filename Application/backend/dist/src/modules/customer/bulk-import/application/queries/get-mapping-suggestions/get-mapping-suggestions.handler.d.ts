import { IQueryHandler } from '@nestjs/cqrs';
import { GetMappingSuggestionsQuery } from './get-mapping-suggestions.query';
interface MappingSuggestion {
    sourceColumn: string;
    suggestedField: string;
    confidence: number;
}
export declare class GetMappingSuggestionsHandler implements IQueryHandler<GetMappingSuggestionsQuery> {
    private readonly logger;
    execute(query: GetMappingSuggestionsQuery): Promise<{
        targetFields: {
            field: string;
            label: string;
            type: string;
        }[];
        suggestions: MappingSuggestion[];
    }>;
}
export {};
