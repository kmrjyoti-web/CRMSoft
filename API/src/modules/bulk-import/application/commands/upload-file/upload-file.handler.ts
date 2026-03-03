import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { FileParserService } from '../../../services/file-parser.service';
import { ProfileMatcherService } from '../../../services/profile-matcher.service';
import { UploadFileCommand } from './upload-file.command';

@CommandHandler(UploadFileCommand)
export class UploadFileHandler implements ICommandHandler<UploadFileCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileParser: FileParserService,
    private readonly profileMatcher: ProfileMatcherService,
  ) {}

  async execute(cmd: UploadFileCommand) {
    // Parse file
    const parsed = await this.fileParser.parse(cmd.buffer, cmd.fileName, cmd.fileSize);

    // Create import job
    const job = await this.prisma.importJob.create({
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
      await this.prisma.importRow.createMany({ data: rowData.slice(i, i + chunkSize) });
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
  }
}
