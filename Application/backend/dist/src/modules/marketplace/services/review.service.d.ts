import { PrismaService } from '../../../core/prisma/prisma.service';
export declare class ReviewService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(tenantId: string, moduleId: string, data: {
        rating: number;
        title?: string;
        comment?: string;
    }): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        moduleId: string;
        title: string | null;
        comment: string | null;
        rating: number;
        helpfulCount: number;
        vendorResponse: string | null;
        vendorResponseAt: Date | null;
    }>;
    listForModule(moduleId: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            moduleId: string;
            title: string | null;
            comment: string | null;
            rating: number;
            helpfulCount: number;
            vendorResponse: string | null;
            vendorResponseAt: Date | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    recalculateRating(moduleId: string): Promise<{
        avgRating: number;
        reviewCount: number;
    }>;
}
