import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { FileParserService } from '../../../services/file-parser.service';
import { ProfileMatcherService } from '../../../services/profile-matcher.service';
import { UploadFileCommand } from './upload-file.command';

@CommandHandler(UploadFileCommand)
export class UploadFileHandler implements ICommandHandler<UploadFileCommand> {
    private readonly logger = new Logger(UploadFileHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileParser: FileParserService,
    private readonly profileMatcher: ProfileMatcherService,
  ) {}

  async execute(cmd: UploadFileCommand) {
    try {
      // Parse file
      const parsed = await this.fileParser.parse(cmd.buffer, cmd.fileName, cmd.fileSize);

      // Sanitize: strip null bytes from all string values (PostgreSQL rejects \0)
      const sanitize = (obj: any): any => {
        if (typeof obj === 'string') return obj.replace(/\0/g, '');
        if (Array.isArray(obj)) return obj.map(sanitize);
        if (obj && typeof obj === 'object') {
          const clean: any = {};
          for (const [k, v] of Object.entries(obj)) clean[k] = sanitize(v);
          return clean;
        }
        return obj;
      };
      parsed.rows = sanitize(parsed.rows);
      parsed.sampleData = sanitize(parsed.sampleData);
      parsed.headers = parsed.headers.map((h: string) => h.replace(/\0/g, ''));

      // Create import job
      const job = await this.prisma.working.importJob.create({
        data: {
          fileName: cmd.fileName,
          fileType: cmd.fileType,
          fileSize: cmd.fileSize,
          targetEntity: cmd.targetEntity as any,
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

      // Create ImportRows with raw ROW_DATA
      const rowData = parsed.rows.map((row, idx) => ({
        importJobId: job.id,
        rowNumber: idx + 1,
        rowData: row,
        rowStatus: 'PENDING' as any,
      }));

      // Batch insert rows (chunked for large files)
      const chunkSize = 500;
      for (let i = 0; i < rowData.length; i += chunkSize) {
        await this.prisma.working.importRow.createMany({ data: rowData.slice(i, i + chunkSize) });
      }

      // Suggest profiles for these headers
      const suggestedProfiles = await this.profileMatcher.suggestProfiles(
        parsed.headers, cmd.targetEntity,
      );

      return {
        jobId: job.id,
        headers: parsed.headers,
        totalRows: parsed.totalRows,
        sampleData: parsed.sampleData,
        suggestedProfiles,
      };
    } catch (error) {
      this.logger.error(`UploadFileHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
