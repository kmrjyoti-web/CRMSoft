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
var UploadFileHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadFileHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const file_parser_service_1 = require("../../../services/file-parser.service");
const profile_matcher_service_1 = require("../../../services/profile-matcher.service");
const upload_file_command_1 = require("./upload-file.command");
let UploadFileHandler = UploadFileHandler_1 = class UploadFileHandler {
    constructor(prisma, fileParser, profileMatcher) {
        this.prisma = prisma;
        this.fileParser = fileParser;
        this.profileMatcher = profileMatcher;
        this.logger = new common_1.Logger(UploadFileHandler_1.name);
    }
    async execute(cmd) {
        try {
            const parsed = await this.fileParser.parse(cmd.buffer, cmd.fileName, cmd.fileSize);
            const sanitize = (obj) => {
                if (typeof obj === 'string')
                    return obj.replace(/\0/g, '');
                if (Array.isArray(obj))
                    return obj.map(sanitize);
                if (obj && typeof obj === 'object') {
                    const clean = {};
                    for (const [k, v] of Object.entries(obj))
                        clean[k] = sanitize(v);
                    return clean;
                }
                return obj;
            };
            parsed.rows = sanitize(parsed.rows);
            parsed.sampleData = sanitize(parsed.sampleData);
            parsed.headers = parsed.headers.map((h) => h.replace(/\0/g, ''));
            const job = await this.prisma.working.importJob.create({
                data: {
                    fileName: cmd.fileName,
                    fileType: cmd.fileType,
                    fileSize: cmd.fileSize,
                    targetEntity: cmd.targetEntity,
                    status: 'PARSED',
                    fileHeaders: parsed.headers,
                    totalRows: parsed.totalRows,
                    sampleData: parsed.sampleData,
                    duplicateCheckFields: [],
                    fuzzyMatchFields: [],
                    createdById: cmd.createdById,
                    createdByName: cmd.createdByName,
                },
            });
            const rowData = parsed.rows.map((row, idx) => ({
                importJobId: job.id,
                rowNumber: idx + 1,
                rowData: row,
                rowStatus: 'PENDING',
            }));
            const chunkSize = 500;
            for (let i = 0; i < rowData.length; i += chunkSize) {
                await this.prisma.working.importRow.createMany({ data: rowData.slice(i, i + chunkSize) });
            }
            const suggestedProfiles = await this.profileMatcher.suggestProfiles(parsed.headers, cmd.targetEntity);
            return {
                jobId: job.id,
                headers: parsed.headers,
                totalRows: parsed.totalRows,
                sampleData: parsed.sampleData,
                suggestedProfiles,
            };
        }
        catch (error) {
            this.logger.error(`UploadFileHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UploadFileHandler = UploadFileHandler;
exports.UploadFileHandler = UploadFileHandler = UploadFileHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(upload_file_command_1.UploadFileCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        file_parser_service_1.FileParserService,
        profile_matcher_service_1.ProfileMatcherService])
], UploadFileHandler);
//# sourceMappingURL=upload-file.handler.js.map