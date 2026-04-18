import { PrismaClient } from '@prisma/client';
interface ErrorSeedEntry {
    code: string;
    layer: 'BE' | 'FE' | 'DB' | 'MOB';
    module: string;
    severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
    httpStatus: number;
    messageEn: string;
    messageHi: string;
    solutionEn: string;
    solutionHi: string;
    helpUrl?: string;
    isRetryable?: boolean;
    retryAfterMs?: number;
}
export declare const ERROR_CATALOG_SEED: ErrorSeedEntry[];
export declare function seedErrorCatalog(prisma: PrismaClient): Promise<number>;
export {};
