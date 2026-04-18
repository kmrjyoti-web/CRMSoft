import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { RowValidatorService } from '../../../services/row-validator.service';
import { DuplicateDetectorService } from '../../../services/duplicate-detector.service';
import { PatchGeneratorService } from '../../../services/patch-generator.service';
import { ValidateRowsCommand } from './validate-rows.command';
export declare class ValidateRowsHandler implements ICommandHandler<ValidateRowsCommand> {
    private readonly prisma;
    private readonly rowValidator;
    private readonly duplicateDetector;
    private readonly patchGenerator;
    private readonly logger;
    constructor(prisma: PrismaService, rowValidator: RowValidatorService, duplicateDetector: DuplicateDetectorService, patchGenerator: PatchGeneratorService);
    execute(cmd: ValidateRowsCommand): Promise<{
        totalRows: number;
        valid: number;
        invalid: number;
        duplicateExact: number;
        duplicateFuzzy: number;
        duplicateInFile: number;
    }>;
}
