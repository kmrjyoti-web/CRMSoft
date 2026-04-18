import { PrismaService } from "../../../../../core/prisma/prisma.service";
export declare const TEST_PLAN_REPOSITORY: unique symbol;
export interface ITestPlanRepository {
    create(data: CreateTestPlanData): Promise<any>;
    findById(id: string): Promise<any | null>;
    findByTenantId(tenantId: string, filters: ListTestPlanFilters): Promise<any>;
    update(id: string, data: Partial<CreateTestPlanData>): Promise<any>;
    softDelete(id: string): Promise<void>;
    recalcStats(planId: string): Promise<void>;
    createItem(data: CreateTestPlanItemData): Promise<any>;
    findItemById(id: string): Promise<any | null>;
    updateItem(id: string, data: Partial<CreateTestPlanItemData>): Promise<any>;
    deleteItem(id: string): Promise<void>;
    createEvidence(data: CreateTestEvidenceData): Promise<any>;
    deleteEvidence(id: string): Promise<void>;
}
export interface CreateTestPlanData {
    tenantId: string;
    name: string;
    description?: string;
    version?: string;
    targetModules: string[];
    createdById: string;
}
export interface CreateTestPlanItemData {
    planId: string;
    moduleName: string;
    componentName: string;
    functionality: string;
    layer: string;
    priority?: string;
    sortOrder?: number;
}
export interface CreateTestEvidenceData {
    planItemId: string;
    fileType: string;
    fileName: string;
    filePath: string;
    fileSize?: number;
    mimeType?: string;
    caption?: string;
    uploadedById?: string;
}
export interface ListTestPlanFilters {
    status?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}
export declare class PrismaTestPlanRepository implements ITestPlanRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: CreateTestPlanData): Promise<any>;
    findById(id: string): Promise<any | null>;
    findByTenantId(tenantId: string, filters: ListTestPlanFilters): Promise<any>;
    update(id: string, data: Partial<CreateTestPlanData>): Promise<any>;
    softDelete(id: string): Promise<void>;
    recalcStats(planId: string): Promise<void>;
    createItem(data: CreateTestPlanItemData): Promise<any>;
    findItemById(id: string): Promise<any | null>;
    updateItem(id: string, data: Partial<CreateTestPlanItemData>): Promise<any>;
    deleteItem(id: string): Promise<void>;
    createEvidence(data: CreateTestEvidenceData): Promise<any>;
    deleteEvidence(id: string): Promise<void>;
}
