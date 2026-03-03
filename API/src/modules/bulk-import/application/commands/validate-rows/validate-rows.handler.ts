import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { RowValidatorService } from '../../../services/row-validator.service';
import { DuplicateDetectorService } from '../../../services/duplicate-detector.service';
import { PatchGeneratorService } from '../../../services/patch-generator.service';
import { ValidateRowsCommand } from './validate-rows.command';

@CommandHandler(ValidateRowsCommand)
export class ValidateRowsHandler implements ICommandHandler<ValidateRowsCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rowValidator: RowValidatorService,
    private readonly duplicateDetector: DuplicateDetectorService,
    private readonly patchGenerator: PatchGeneratorService,
  ) {}

  async execute(cmd: ValidateRowsCommand) {
    await this.prisma.importJob.update({ where: { id: cmd.jobId }, data: { status: 'VALIDATING' } });

    const job = await this.prisma.importJob.findUniqueOrThrow({ where: { id: cmd.jobId } });
    const rows = await this.prisma.importRow.findMany({
      where: { importJobId: cmd.jobId },
      orderBy: { rowNumber: 'asc' },
    });

    const validationRules = (job.validationRules as any[]) || [];
    const checkFields = job.duplicateCheckFields || [];
    const fuzzyFields = job.fuzzyMatchFields || [];
    const threshold = Number(job.fuzzyThreshold) || 0.85;

    const rowInputs = rows.map(r => ({ rowNumber: r.rowNumber, mappedData: (r.mappedData || {}) as Record<string, any> }));

    // Step 1: Validate
    const validationResults = this.rowValidator.validateAllRows(rowInputs, validationRules);

    // Step 2: In-file duplicates
    const inFileDups = this.duplicateDetector.detectInFileDuplicates(rowInputs, checkFields);

    // Step 3: Exact DB duplicates
    const exactDups = await this.duplicateDetector.detectExactDbDuplicates(rowInputs, checkFields, job.targetEntity);

    // Step 4: Fuzzy DB duplicates (only for non-exact matched rows)
    let fuzzyDups = new Map<number, any>();
    if (job.fuzzyMatchEnabled && fuzzyFields.length > 0) {
      const nonExact = rowInputs.filter(r => !exactDups.has(r.rowNumber) && !inFileDups.has(r.rowNumber));
      fuzzyDups = await this.duplicateDetector.detectFuzzyDbDuplicates(nonExact, fuzzyFields, job.targetEntity, threshold);
    }

    // Step 5: Generate patch previews for UPDATE duplicates
    const updateRows = rows
      .filter(r => exactDups.has(r.rowNumber) && exactDups.get(r.rowNumber)!.duplicateOfEntityId)
      .map(r => ({
        rowNumber: r.rowNumber,
        mappedData: (r.mappedData || {}) as Record<string, any>,
        entityId: exactDups.get(r.rowNumber)!.duplicateOfEntityId!,
      }));
    const patches = await this.patchGenerator.generatePatchesForRows(updateRows, job.targetEntity);

    // Update each row status
    let validCount = 0, invalidCount = 0, exactDupCount = 0, fuzzyDupCount = 0, inFileDupCount = 0;

    for (const row of rows) {
      const updateData: any = {};
      const validation = validationResults.get(row.rowNumber);
      const inFile = inFileDups.get(row.rowNumber);
      const exact = exactDups.get(row.rowNumber);
      const fuzzy = fuzzyDups.get(row.rowNumber);

      if (validation) {
        updateData.validationErrors = validation.errors.length > 0 ? validation.errors : undefined;
        updateData.validationWarnings = validation.warnings.length > 0 ? validation.warnings : undefined;
        if (validation.cleanedData) updateData.mappedData = validation.cleanedData;
      }

      if (validation && !validation.valid) {
        updateData.rowStatus = 'INVALID';
        invalidCount++;
      } else if (inFile) {
        updateData.rowStatus = 'DUPLICATE_IN_FILE';
        updateData.isDuplicate = true;
        updateData.duplicateType = inFile.duplicateType;
        updateData.duplicateOfRowNumber = inFile.duplicateOfRowNumber;
        updateData.duplicateMatchField = inFile.duplicateMatchField;
        updateData.duplicateMatchValue = inFile.duplicateMatchValue;
        inFileDupCount++;
      } else if (exact) {
        updateData.rowStatus = 'DUPLICATE_EXACT';
        updateData.isDuplicate = true;
        updateData.duplicateType = exact.duplicateType;
        updateData.duplicateOfEntityId = exact.duplicateOfEntityId;
        updateData.duplicateMatchField = exact.duplicateMatchField;
        updateData.duplicateMatchValue = exact.duplicateMatchValue;
        const patch = patches.get(row.rowNumber);
        if (patch) updateData.patchPreview = patch;
        exactDupCount++;
      } else if (fuzzy) {
        updateData.rowStatus = 'DUPLICATE_FUZZY';
        updateData.isDuplicate = true;
        updateData.duplicateType = fuzzy.duplicateType;
        updateData.fuzzyMatchScore = fuzzy.fuzzyMatchScore;
        updateData.fuzzyMatchDetails = fuzzy.fuzzyMatchDetails;
        fuzzyDupCount++;
      } else {
        updateData.rowStatus = 'VALID';
        validCount++;
      }

      await this.prisma.importRow.update({ where: { id: row.id }, data: updateData });
    }

    // Update job counts
    await this.prisma.importJob.update({
      where: { id: cmd.jobId },
      data: {
        status: 'VALIDATED',
        validRows: validCount,
        invalidRows: invalidCount,
        duplicateExactRows: exactDupCount,
        duplicateFuzzyRows: fuzzyDupCount,
        duplicateInFileRows: inFileDupCount,
      },
    });

    return {
      totalRows: rows.length,
      valid: validCount,
      invalid: invalidCount,
      duplicateExact: exactDupCount,
      duplicateFuzzy: fuzzyDupCount,
      duplicateInFile: inFileDupCount,
    };
  }
}
