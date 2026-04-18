import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
export interface CatalogEntry {
    code: string;
    layer: string;
    module: string;
    severity: string;
    httpStatus: number;
    messageEn: string;
    messageHi: string | null;
    solutionEn: string | null;
    solutionHi: string | null;
    technicalInfo: string | null;
    helpUrl: string | null;
    isRetryable: boolean;
    retryAfterMs: number | null;
}
export declare class ErrorCatalogService implements OnModuleInit {
    private readonly prisma;
    private readonly logger;
    private cache;
    private lastRefresh;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    getByCode(code: string): Promise<CatalogEntry | null>;
    getAll(): Promise<CatalogEntry[]>;
    getByModule(moduleName: string): Promise<CatalogEntry[]>;
    getByLayer(layer: string): Promise<CatalogEntry[]>;
    refreshCache(): Promise<number>;
    private ensureFresh;
}
