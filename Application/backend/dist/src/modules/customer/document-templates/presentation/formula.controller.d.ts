import { ApiResponse } from '../../../../common/utils/api-response';
import { FormulaService } from '../services/formula.service';
declare class CreateFormulaDto {
    name: string;
    category: string;
    expression: string;
    description?: string;
    requiredFields?: string[];
    outputType?: string;
    outputFormat?: string;
}
declare class UpdateFormulaDto {
    name?: string;
    category?: string;
    expression?: string;
    description?: string;
    requiredFields?: string[];
    outputType?: string;
    outputFormat?: string;
}
declare class EvaluateFormulaDto {
    expression: string;
    variables?: Record<string, any>;
}
export declare class FormulaController {
    private readonly formulaService;
    constructor(formulaService: FormulaService);
    findAll(user: any, category?: string): Promise<ApiResponse<{
        id: string;
        tenantId: string | null;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        category: string;
        isSystem: boolean;
        expression: string;
        requiredFields: import("@prisma/working-client/runtime/library").JsonValue;
        outputType: string;
        outputFormat: string | null;
    }[]>>;
    findById(id: string): Promise<ApiResponse<{
        id: string;
        tenantId: string | null;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        category: string;
        isSystem: boolean;
        expression: string;
        requiredFields: import("@prisma/working-client/runtime/library").JsonValue;
        outputType: string;
        outputFormat: string | null;
    }>>;
    create(user: any, dto: CreateFormulaDto): Promise<ApiResponse<{
        id: string;
        tenantId: string | null;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        category: string;
        isSystem: boolean;
        expression: string;
        requiredFields: import("@prisma/working-client/runtime/library").JsonValue;
        outputType: string;
        outputFormat: string | null;
    }>>;
    update(id: string, dto: UpdateFormulaDto): Promise<ApiResponse<{
        id: string;
        tenantId: string | null;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        category: string;
        isSystem: boolean;
        expression: string;
        requiredFields: import("@prisma/working-client/runtime/library").JsonValue;
        outputType: string;
        outputFormat: string | null;
    }>>;
    delete(id: string): Promise<ApiResponse<null>>;
    evaluate(dto: EvaluateFormulaDto): Promise<ApiResponse<{
        result: unknown;
    }>>;
}
export {};
