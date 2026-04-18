import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class ServiceRateService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getRate(serviceKey: string): Promise<{
        id: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        displayName: string;
        serviceKey: string;
        baseTokens: number;
        marginPct: number;
        finalTokens: number;
    } | null>;
    estimateCost(serviceKey: string): Promise<{
        serviceKey: string;
        displayName: string;
        category: string;
        baseTokens: number;
        marginPct: number;
        finalTokens: number;
    } | null>;
    findAll(params?: {
        category?: string;
        isActive?: boolean;
    }): Promise<{
        id: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        displayName: string;
        serviceKey: string;
        baseTokens: number;
        marginPct: number;
        finalTokens: number;
    }[]>;
    findById(id: string): Promise<{
        id: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        displayName: string;
        serviceKey: string;
        baseTokens: number;
        marginPct: number;
        finalTokens: number;
    }>;
    create(data: {
        serviceKey: string;
        displayName: string;
        category: string;
        baseTokens: number;
        marginPct?: number;
        description?: string;
    }): Promise<{
        id: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        displayName: string;
        serviceKey: string;
        baseTokens: number;
        marginPct: number;
        finalTokens: number;
    }>;
    update(id: string, data: Partial<{
        displayName: string;
        category: string;
        baseTokens: number;
        marginPct: number;
        description: string;
        isActive: boolean;
    }>): Promise<{
        id: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        displayName: string;
        serviceKey: string;
        baseTokens: number;
        marginPct: number;
        finalTokens: number;
    }>;
    delete(id: string): Promise<{
        id: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        displayName: string;
        serviceKey: string;
        baseTokens: number;
        marginPct: number;
        finalTokens: number;
    }>;
}
