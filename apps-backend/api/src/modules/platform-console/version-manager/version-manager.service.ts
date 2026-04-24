import { Injectable, HttpException, Logger } from '@nestjs/common';
import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
import { CreateReleaseDto } from './dto/create-release.dto';
import { UpdateReleaseDto } from './dto/update-release.dto';
import { VERSION_MANAGER_ERRORS } from './version-manager.errors';

const SEMVER_REGEX = /^\d+\.\d+\.\d+(-[\w.]+)?$/;

@Injectable()
export class VersionManagerService {
  private readonly logger = new Logger(VersionManagerService.name);

  constructor(private readonly db: PlatformConsolePrismaService) {}

  async createRelease(dto: CreateReleaseDto) {
    try {
      if (!SEMVER_REGEX.test(dto.version)) {
        const err = VERSION_MANAGER_ERRORS.INVALID_SEMVER;
        throw new HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
      }

      const existing = await this.db.versionRelease.findFirst({
        where: { version: dto.version, verticalType: dto.verticalType ?? null },
      });

      if (existing) {
        const err = VERSION_MANAGER_ERRORS.DUPLICATE_VERSION;
        throw new HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
      }

      const release = await this.db.versionRelease.create({
        data: {
          version: dto.version,
          verticalType: dto.verticalType ?? null,
          releaseType: dto.releaseType,
          releaseNotes: dto.releaseNotes ?? null,
          gitTag: dto.gitTag ?? null,
          gitCommitHash: dto.gitCommitHash ?? null,
          status: 'DRAFT',
        },
      });

      this.logger.log(`Release created: ${release.version} (${release.verticalType ?? 'PLATFORM'})`);
      return release;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Failed to create release', (error as Error).stack);
      throw error;
    }
  }

  async publishRelease(id: string, publishedBy: string) {
    try {
      const release = await this.db.versionRelease.findUnique({ where: { id } });

      if (!release) {
        const err = VERSION_MANAGER_ERRORS.RELEASE_NOT_FOUND;
        throw new HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
      }

      if (release.status !== 'DRAFT' && release.status !== 'STAGING') {
        const err = VERSION_MANAGER_ERRORS.CANNOT_PUBLISH;
        throw new HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
      }

      const updated = await this.db.versionRelease.update({
        where: { id },
        data: {
          status: 'RELEASED',
          releasedAt: new Date(),
          releasedBy: publishedBy,
        },
      });

      // Upsert VerticalVersion
      if (release.verticalType) {
        await this.db.verticalVersion.upsert({
          where: { verticalType: release.verticalType },
          update: {
            currentVersion: release.version,
            lastUpdated: new Date(),
            healthStatus: 'HEALTHY',
          },
          create: {
            verticalType: release.verticalType,
            currentVersion: release.version,
            lastUpdated: new Date(),
            healthStatus: 'HEALTHY',
          },
        });
      }

      this.logger.log(`Release published: ${release.version} by ${publishedBy}`);
      return updated;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Failed to publish release', (error as Error).stack);
      throw error;
    }
  }

  async rollbackRelease(id: string, reason: string, rolledBackBy: string) {
    try {
      const release = await this.db.versionRelease.findUnique({ where: { id } });

      if (!release) {
        const err = VERSION_MANAGER_ERRORS.RELEASE_NOT_FOUND;
        throw new HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
      }

      // Find previous RELEASED version for same verticalType
      const previousRelease = await this.db.versionRelease.findFirst({
        where: {
          verticalType: release.verticalType,
          status: 'RELEASED',
          id: { not: id },
        },
        orderBy: { releasedAt: 'desc' },
      });

      if (!previousRelease) {
        const err = VERSION_MANAGER_ERRORS.NO_PREVIOUS_VERSION;
        throw new HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
      }

      // Create rollback log
      await this.db.rollbackLog.create({
        data: {
          fromVersion: release.version,
          toVersion: previousRelease.version,
          reason,
          rolledBackBy,
          rolledBackAt: new Date(),
        },
      });

      // Update current release status
      await this.db.versionRelease.update({
        where: { id },
        data: { status: 'ROLLED_BACK' },
      });

      // Revert VerticalVersion
      if (release.verticalType) {
        await this.db.verticalVersion.update({
          where: { verticalType: release.verticalType },
          data: {
            currentVersion: previousRelease.version,
            lastUpdated: new Date(),
          },
        });
      }

      this.logger.log(`Release ${release.version} rolled back to ${previousRelease.version} by ${rolledBackBy}`);
      return { rolledBackTo: previousRelease.version, reason };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Failed to rollback release', (error as Error).stack);
      throw error;
    }
  }

  async getReleases(filters: { verticalType?: string; status?: string; page?: number; limit?: number }) {
    try {
      const page = filters.page ?? 1;
      const limit = filters.limit ?? 20;
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = {};
      if (filters.verticalType) where.verticalType = filters.verticalType;
      if (filters.status) where.status = filters.status;

      const [data, total] = await Promise.all([
        this.db.versionRelease.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.db.versionRelease.count({ where }),
      ]);

      return { data, total, page, limit };
    } catch (error) {
      this.logger.error('Failed to get releases', (error as Error).stack);
      throw error;
    }
  }

  async getRelease(id: string) {
    try {
      const release = await this.db.versionRelease.findUnique({ where: { id } });

      if (!release) {
        const err = VERSION_MANAGER_ERRORS.RELEASE_NOT_FOUND;
        throw new HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
      }

      return release;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Failed to get release', (error as Error).stack);
      throw error;
    }
  }

  async updateRelease(id: string, dto: UpdateReleaseDto) {
    try {
      const release = await this.db.versionRelease.findUnique({ where: { id } });

      if (!release) {
        const err = VERSION_MANAGER_ERRORS.RELEASE_NOT_FOUND;
        throw new HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
      }

      const data: Record<string, unknown> = {};
      if (dto.releaseNotes !== undefined) data.releaseNotes = dto.releaseNotes;
      if (dto.status !== undefined) data.status = dto.status;
      if (dto.gitTag !== undefined) data.gitTag = dto.gitTag;
      if (dto.gitCommitHash !== undefined) data.gitCommitHash = dto.gitCommitHash;

      const updated = await this.db.versionRelease.update({ where: { id }, data });
      this.logger.log(`Release updated: ${id}`);
      return updated;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Failed to update release', (error as Error).stack);
      throw error;
    }
  }

  async getVerticalVersions() {
    try {
      return await this.db.verticalVersion.findMany();
    } catch (error) {
      this.logger.error('Failed to get vertical versions', (error as Error).stack);
      throw error;
    }
  }

  async getVerticalVersion(type: string) {
    try {
      const version = await this.db.verticalVersion.findUnique({ where: { verticalType: type } });

      if (!version) {
        const err = VERSION_MANAGER_ERRORS.RELEASE_NOT_FOUND;
        throw new HttpException({ code: err.code, message: `Vertical version not found for type: ${type}`, messageHi: err.messageHi }, err.statusCode);
      }

      return version;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error('Failed to get vertical version', (error as Error).stack);
      throw error;
    }
  }

  async getRollbacks(params: { page?: number; limit?: number }) {
    try {
      const page = params.page ?? 1;
      const limit = params.limit ?? 20;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.db.rollbackLog.findMany({
          orderBy: { rolledBackAt: 'desc' },
          skip,
          take: limit,
        }),
        this.db.rollbackLog.count(),
      ]);

      return { data, total, page, limit };
    } catch (error) {
      this.logger.error('Failed to get rollbacks', (error as Error).stack);
      throw error;
    }
  }
}
