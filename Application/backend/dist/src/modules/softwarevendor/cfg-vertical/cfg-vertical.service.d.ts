import { PrismaService } from '../../../core/prisma/prisma.service';
export declare class CfgVerticalService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    listAll(): Promise<({
        modules: {
            id: string;
            createdAt: Date;
            isRequired: boolean;
            moduleCode: string;
            verticalId: string;
        }[];
    } & {
        id: string;
        name: string;
        code: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        metadata: import("@prisma/platform-client/runtime/library").JsonValue | null;
        tablePrefix: string;
        isBuilt: boolean;
    })[]>;
    findActive(): Promise<({
        modules: {
            id: string;
            createdAt: Date;
            isRequired: boolean;
            moduleCode: string;
            verticalId: string;
        }[];
    } & {
        id: string;
        name: string;
        code: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        metadata: import("@prisma/platform-client/runtime/library").JsonValue | null;
        tablePrefix: string;
        isBuilt: boolean;
    })[]>;
    findBuilt(): Promise<({
        modules: {
            id: string;
            createdAt: Date;
            isRequired: boolean;
            moduleCode: string;
            verticalId: string;
        }[];
    } & {
        id: string;
        name: string;
        code: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        metadata: import("@prisma/platform-client/runtime/library").JsonValue | null;
        tablePrefix: string;
        isBuilt: boolean;
    })[]>;
    findByCode(code: string): Promise<{
        modules: {
            id: string;
            createdAt: Date;
            isRequired: boolean;
            moduleCode: string;
            verticalId: string;
        }[];
    } & {
        id: string;
        name: string;
        code: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        sortOrder: number;
        metadata: import("@prisma/platform-client/runtime/library").JsonValue | null;
        tablePrefix: string;
        isBuilt: boolean;
    }>;
}
