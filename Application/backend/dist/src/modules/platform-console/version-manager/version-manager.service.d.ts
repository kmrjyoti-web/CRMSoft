import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
import { CreateReleaseDto } from './dto/create-release.dto';
import { UpdateReleaseDto } from './dto/update-release.dto';
export declare class VersionManagerService {
    private readonly db;
    private readonly logger;
    constructor(db: PlatformConsolePrismaService);
    createRelease(dto: CreateReleaseDto): Promise<{
        id: string;
        version: string;
        createdAt: Date;
        status: string;
        releaseType: string;
        gitTag: string | null;
        gitCommitHash: string | null;
        verticalType: string | null;
        releaseNotes: string | null;
        releasedAt: Date | null;
        releasedBy: string | null;
    }>;
    publishRelease(id: string, publishedBy: string): Promise<{
        id: string;
        version: string;
        createdAt: Date;
        status: string;
        releaseType: string;
        gitTag: string | null;
        gitCommitHash: string | null;
        verticalType: string | null;
        releaseNotes: string | null;
        releasedAt: Date | null;
        releasedBy: string | null;
    }>;
    rollbackRelease(id: string, reason: string, rolledBackBy: string): Promise<{
        rolledBackTo: string;
        reason: string;
    }>;
    getReleases(filters: {
        verticalType?: string;
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: {
            id: string;
            version: string;
            createdAt: Date;
            status: string;
            releaseType: string;
            gitTag: string | null;
            gitCommitHash: string | null;
            verticalType: string | null;
            releaseNotes: string | null;
            releasedAt: Date | null;
            releasedBy: string | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getRelease(id: string): Promise<{
        id: string;
        version: string;
        createdAt: Date;
        status: string;
        releaseType: string;
        gitTag: string | null;
        gitCommitHash: string | null;
        verticalType: string | null;
        releaseNotes: string | null;
        releasedAt: Date | null;
        releasedBy: string | null;
    }>;
    updateRelease(id: string, dto: UpdateReleaseDto): Promise<{
        id: string;
        version: string;
        createdAt: Date;
        status: string;
        releaseType: string;
        gitTag: string | null;
        gitCommitHash: string | null;
        verticalType: string | null;
        releaseNotes: string | null;
        releasedAt: Date | null;
        releasedBy: string | null;
    }>;
    getVerticalVersions(): Promise<{
        id: string;
        lastUpdated: Date;
        verticalType: string;
        currentVersion: string;
        modulesCount: number | null;
        endpointsCount: number | null;
        healthStatus: string;
    }[]>;
    getVerticalVersion(type: string): Promise<{
        id: string;
        lastUpdated: Date;
        verticalType: string;
        currentVersion: string;
        modulesCount: number | null;
        endpointsCount: number | null;
        healthStatus: string;
    }>;
    getRollbacks(params: {
        page?: number;
        limit?: number;
    }): Promise<{
        data: {
            id: string;
            reason: string;
            fromVersion: string;
            toVersion: string;
            rolledBackBy: string;
            rolledBackAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
}
