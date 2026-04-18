import { VersionManagerService } from './version-manager.service';
import { CreateReleaseDto } from './dto/create-release.dto';
import { UpdateReleaseDto } from './dto/update-release.dto';
export declare class VersionManagerController {
    private readonly versionManagerService;
    constructor(versionManagerService: VersionManagerService);
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
    getRollbacks(page?: string, limit?: string): Promise<{
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
    getReleases(verticalType?: string, status?: string, page?: string, limit?: string): Promise<{
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
    publishRelease(id: string, body: {
        publishedBy: string;
    }): Promise<{
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
    rollbackRelease(id: string, body: {
        reason: string;
        rolledBackBy: string;
    }): Promise<{
        rolledBackTo: string;
        reason: string;
    }>;
}
