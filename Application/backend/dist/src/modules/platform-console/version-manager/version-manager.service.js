"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var VersionManagerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionManagerService = void 0;
const common_1 = require("@nestjs/common");
const platform_console_prisma_service_1 = require("../prisma/platform-console-prisma.service");
const version_manager_errors_1 = require("./version-manager.errors");
const SEMVER_REGEX = /^\d+\.\d+\.\d+(-[\w.]+)?$/;
let VersionManagerService = VersionManagerService_1 = class VersionManagerService {
    constructor(db) {
        this.db = db;
        this.logger = new common_1.Logger(VersionManagerService_1.name);
    }
    async createRelease(dto) {
        try {
            if (!SEMVER_REGEX.test(dto.version)) {
                const err = version_manager_errors_1.VERSION_MANAGER_ERRORS.INVALID_SEMVER;
                throw new common_1.HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
            }
            const existing = await this.db.versionRelease.findFirst({
                where: { version: dto.version, verticalType: dto.verticalType ?? null },
            });
            if (existing) {
                const err = version_manager_errors_1.VERSION_MANAGER_ERRORS.DUPLICATE_VERSION;
                throw new common_1.HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
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
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            this.logger.error('Failed to create release', error.stack);
            throw error;
        }
    }
    async publishRelease(id, publishedBy) {
        try {
            const release = await this.db.versionRelease.findUnique({ where: { id } });
            if (!release) {
                const err = version_manager_errors_1.VERSION_MANAGER_ERRORS.RELEASE_NOT_FOUND;
                throw new common_1.HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
            }
            if (release.status !== 'DRAFT' && release.status !== 'STAGING') {
                const err = version_manager_errors_1.VERSION_MANAGER_ERRORS.CANNOT_PUBLISH;
                throw new common_1.HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
            }
            const updated = await this.db.versionRelease.update({
                where: { id },
                data: {
                    status: 'RELEASED',
                    releasedAt: new Date(),
                    releasedBy: publishedBy,
                },
            });
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
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            this.logger.error('Failed to publish release', error.stack);
            throw error;
        }
    }
    async rollbackRelease(id, reason, rolledBackBy) {
        try {
            const release = await this.db.versionRelease.findUnique({ where: { id } });
            if (!release) {
                const err = version_manager_errors_1.VERSION_MANAGER_ERRORS.RELEASE_NOT_FOUND;
                throw new common_1.HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
            }
            const previousRelease = await this.db.versionRelease.findFirst({
                where: {
                    verticalType: release.verticalType,
                    status: 'RELEASED',
                    id: { not: id },
                },
                orderBy: { releasedAt: 'desc' },
            });
            if (!previousRelease) {
                const err = version_manager_errors_1.VERSION_MANAGER_ERRORS.NO_PREVIOUS_VERSION;
                throw new common_1.HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
            }
            await this.db.rollbackLog.create({
                data: {
                    fromVersion: release.version,
                    toVersion: previousRelease.version,
                    reason,
                    rolledBackBy,
                    rolledBackAt: new Date(),
                },
            });
            await this.db.versionRelease.update({
                where: { id },
                data: { status: 'ROLLED_BACK' },
            });
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
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            this.logger.error('Failed to rollback release', error.stack);
            throw error;
        }
    }
    async getReleases(filters) {
        try {
            const page = filters.page ?? 1;
            const limit = filters.limit ?? 20;
            const skip = (page - 1) * limit;
            const where = {};
            if (filters.verticalType)
                where.verticalType = filters.verticalType;
            if (filters.status)
                where.status = filters.status;
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
        }
        catch (error) {
            this.logger.error('Failed to get releases', error.stack);
            throw error;
        }
    }
    async getRelease(id) {
        try {
            const release = await this.db.versionRelease.findUnique({ where: { id } });
            if (!release) {
                const err = version_manager_errors_1.VERSION_MANAGER_ERRORS.RELEASE_NOT_FOUND;
                throw new common_1.HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
            }
            return release;
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            this.logger.error('Failed to get release', error.stack);
            throw error;
        }
    }
    async updateRelease(id, dto) {
        try {
            const release = await this.db.versionRelease.findUnique({ where: { id } });
            if (!release) {
                const err = version_manager_errors_1.VERSION_MANAGER_ERRORS.RELEASE_NOT_FOUND;
                throw new common_1.HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
            }
            const data = {};
            if (dto.releaseNotes !== undefined)
                data.releaseNotes = dto.releaseNotes;
            if (dto.status !== undefined)
                data.status = dto.status;
            if (dto.gitTag !== undefined)
                data.gitTag = dto.gitTag;
            if (dto.gitCommitHash !== undefined)
                data.gitCommitHash = dto.gitCommitHash;
            const updated = await this.db.versionRelease.update({ where: { id }, data });
            this.logger.log(`Release updated: ${id}`);
            return updated;
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            this.logger.error('Failed to update release', error.stack);
            throw error;
        }
    }
    async getVerticalVersions() {
        try {
            return await this.db.verticalVersion.findMany();
        }
        catch (error) {
            this.logger.error('Failed to get vertical versions', error.stack);
            throw error;
        }
    }
    async getVerticalVersion(type) {
        try {
            const version = await this.db.verticalVersion.findUnique({ where: { verticalType: type } });
            if (!version) {
                const err = version_manager_errors_1.VERSION_MANAGER_ERRORS.RELEASE_NOT_FOUND;
                throw new common_1.HttpException({ code: err.code, message: `Vertical version not found for type: ${type}`, messageHi: err.messageHi }, err.statusCode);
            }
            return version;
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            this.logger.error('Failed to get vertical version', error.stack);
            throw error;
        }
    }
    async getRollbacks(params) {
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
        }
        catch (error) {
            this.logger.error('Failed to get rollbacks', error.stack);
            throw error;
        }
    }
};
exports.VersionManagerService = VersionManagerService;
exports.VersionManagerService = VersionManagerService = VersionManagerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [platform_console_prisma_service_1.PlatformConsolePrismaService])
], VersionManagerService);
//# sourceMappingURL=version-manager.service.js.map