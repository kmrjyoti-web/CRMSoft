import { ConfigService } from '@nestjs/config';
export declare class DbOperationsService {
    private readonly config;
    private readonly logger;
    constructor(config: ConfigService);
    createDatabase(dbName: string): Promise<void>;
    dropDatabase(dbName: string): Promise<void>;
    runMigrations(dbUrl: string, schemaPath: string): Promise<void>;
    runAllMigrations(testDbUrl: string): Promise<number>;
    createBackup(sourceDbUrl: string, outputPath?: string): Promise<{
        filePath: string;
        sizeBytes: number;
        checksum: string;
        tableCount: number;
    }>;
    computeFileChecksum(filePath: string): string;
    cloneDatabase(sourceUrl: string, targetDbName: string): Promise<void>;
    restoreFromBackup(backupFilePath: string, targetDbName: string): Promise<void>;
    getDatabaseSize(dbName: string): Promise<number>;
    runSeedScripts(testDbUrl: string): Promise<number>;
    buildTestDbUrl(testDbName: string): string;
    isPgDumpAvailable(): boolean;
    private swapDatabase;
    parseDbUrl(url: string): {
        host: string;
        port: string;
        user: string;
        password: string;
        database: string;
    };
    private assertPgDumpAvailable;
}
