import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { FileParserService } from '../../../services/file-parser.service';
import { ProfileMatcherService } from '../../../services/profile-matcher.service';
import { UploadFileCommand } from './upload-file.command';
export declare class UploadFileHandler implements ICommandHandler<UploadFileCommand> {
    private readonly prisma;
    private readonly fileParser;
    private readonly profileMatcher;
    private readonly logger;
    constructor(prisma: PrismaService, fileParser: FileParserService, profileMatcher: ProfileMatcherService);
    execute(cmd: UploadFileCommand): Promise<{
        jobId: string;
        headers: string[];
        totalRows: number;
        sampleData: Record<string, string>[];
        suggestedProfiles: import("../../../services/profile-matcher.service").MatchResult[];
    }>;
}
