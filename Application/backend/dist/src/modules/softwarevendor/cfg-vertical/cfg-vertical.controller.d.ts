import { CfgVerticalService } from './cfg-vertical.service';
export declare class CfgVerticalController {
    private readonly service;
    constructor(service: CfgVerticalService);
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
