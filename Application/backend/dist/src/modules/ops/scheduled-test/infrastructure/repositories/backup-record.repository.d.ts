import { PrismaService } from "../../../../../core/prisma/prisma.service";
export declare const BACKUP_RECORD_REPOSITORY: unique symbol;
export interface IBackupRecordRepository {
    create(data: CreateBackupRecordData): Promise<Record<string, unknown>>;
    findById(id: string): Promise<any | null>;
    findByTenantId(tenantId: string, limit?: number): Promise<any[]>;
    findLatestValidated(tenantId: string): Promise<any | null>;
    update(id: string, data: UpdateBackupRecordData): Promise<Record<string, unknown>>;
}
export interface CreateBackupRecordData {
    tenantId: string;
    dbName: string;
    backupUrl: string;
    checksum: string;
    sizeBytes: bigint;
    tableCount?: number;
    rowCount?: bigint;
    expiresAt?: Date;
    createdById?: string;
}
export interface UpdateBackupRecordData {
    isValidated?: boolean;
    validatedAt?: Date;
    tableCount?: number;
    rowCount?: bigint;
}
export declare class PrismaBackupRecordRepository implements IBackupRecordRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: CreateBackupRecordData): Promise<{
        id: string;
        tenantId: string;
        createdById: string | null;
        createdAt: Date;
        sizeBytes: bigint;
        expiresAt: Date | null;
        checksum: string;
        tableCount: number | null;
        dbName: string;
        backupUrl: string;
        rowCount: bigint | null;
        isValidated: boolean;
        validatedAt: Date | null;
    }>;
    findById(id: string): Promise<{
        id: string;
        tenantId: string;
        createdById: string | null;
        createdAt: Date;
        sizeBytes: bigint;
        expiresAt: Date | null;
        checksum: string;
        tableCount: number | null;
        dbName: string;
        backupUrl: string;
        rowCount: bigint | null;
        isValidated: boolean;
        validatedAt: Date | null;
    } | null>;
    findByTenantId(tenantId: string, limit?: number): Promise<{
        id: string;
        tenantId: string;
        createdById: string | null;
        createdAt: Date;
        sizeBytes: bigint;
        expiresAt: Date | null;
        checksum: string;
        tableCount: number | null;
        dbName: string;
        backupUrl: string;
        rowCount: bigint | null;
        isValidated: boolean;
        validatedAt: Date | null;
    }[]>;
    findLatestValidated(tenantId: string): Promise<any | null>;
    update(id: string, data: UpdateBackupRecordData): Promise<{
        id: string;
        tenantId: string;
        createdById: string | null;
        createdAt: Date;
        sizeBytes: bigint;
        expiresAt: Date | null;
        checksum: string;
        tableCount: number | null;
        dbName: string;
        backupUrl: string;
        rowCount: bigint | null;
        isValidated: boolean;
        validatedAt: Date | null;
    }>;
}
