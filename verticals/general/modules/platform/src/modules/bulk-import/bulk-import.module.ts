import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MulterModule } from '@nestjs/platform-express';

// Controllers
import { ImportController } from './presentation/import.controller';
import { ProfileController } from './presentation/profile.controller';

// Services
import { FileParserService } from './services/file-parser.service';
import { IndianValidatorsService } from './services/indian-validators.service';
import { FuzzyMatcherService } from './services/fuzzy-matcher.service';
import { ProfileMatcherService } from './services/profile-matcher.service';
import { FieldMapperService } from './services/field-mapper.service';
import { RowValidatorService } from './services/row-validator.service';
import { DuplicateDetectorService } from './services/duplicate-detector.service';
import { PatchGeneratorService } from './services/patch-generator.service';
import { ImportExecutorService } from './services/import-executor.service';
import { ResultReportService } from './services/result-report.service';

// Command Handlers
import { UploadFileHandler } from './application/commands/upload-file/upload-file.handler';
import { SelectProfileHandler } from './application/commands/select-profile/select-profile.handler';
import { ApplyMappingHandler } from './application/commands/apply-mapping/apply-mapping.handler';
import { SaveProfileHandler } from './application/commands/save-profile/save-profile.handler';
import { ValidateRowsHandler } from './application/commands/validate-rows/validate-rows.handler';
import { CommitImportHandler } from './application/commands/commit-import/commit-import.handler';
import { CancelImportHandler } from './application/commands/cancel-import/cancel-import.handler';
import { RowActionHandler } from './application/commands/row-action/row-action.handler';
import { RowBulkActionHandler } from './application/commands/row-bulk-action/row-bulk-action.handler';
import { EditRowHandler } from './application/commands/edit-row/edit-row.handler';
import { RevalidateRowHandler } from './application/commands/revalidate-row/revalidate-row.handler';
import { CreateProfileHandler } from './application/commands/create-profile/create-profile.handler';
import { UpdateProfileHandler } from './application/commands/update-profile/update-profile.handler';
import { DeleteProfileHandler } from './application/commands/delete-profile/delete-profile.handler';
import { CloneProfileHandler } from './application/commands/clone-profile/clone-profile.handler';

// Query Handlers
import { GetJobListHandler } from './application/queries/get-job-list/get-job-list.handler';
import { GetJobDetailHandler } from './application/queries/get-job-detail/get-job-detail.handler';
import { GetValidationSummaryHandler } from './application/queries/get-validation-summary/get-validation-summary.handler';
import { GetDuplicatesHandler } from './application/queries/get-duplicates/get-duplicates.handler';
import { GetJobResultHandler } from './application/queries/get-job-result/get-job-result.handler';
import { GetJobRowsHandler } from './application/queries/get-job-rows/get-job-rows.handler';
import { GetRowDetailHandler } from './application/queries/get-row-detail/get-row-detail.handler';
import { GetMappingSuggestionsHandler } from './application/queries/get-mapping-suggestions/get-mapping-suggestions.handler';
import { GetProfileListHandler } from './application/queries/get-profile-list/get-profile-list.handler';
import { GetProfileDetailHandler } from './application/queries/get-profile-detail/get-profile-detail.handler';

const CommandHandlers = [
  UploadFileHandler, SelectProfileHandler, ApplyMappingHandler,
  SaveProfileHandler, ValidateRowsHandler, CommitImportHandler,
  CancelImportHandler, RowActionHandler, RowBulkActionHandler,
  EditRowHandler, RevalidateRowHandler,
  CreateProfileHandler, UpdateProfileHandler, DeleteProfileHandler, CloneProfileHandler,
];

const QueryHandlers = [
  GetJobListHandler, GetJobDetailHandler, GetValidationSummaryHandler,
  GetDuplicatesHandler, GetJobResultHandler, GetJobRowsHandler,
  GetRowDetailHandler, GetMappingSuggestionsHandler,
  GetProfileListHandler, GetProfileDetailHandler,
];

@Module({
  imports: [
    CqrsModule,
    MulterModule.register({ storage: undefined }), // memory storage for buffer access
  ],
  controllers: [ImportController, ProfileController],
  providers: [
    FileParserService, IndianValidatorsService, FuzzyMatcherService,
    ProfileMatcherService, FieldMapperService, RowValidatorService,
    DuplicateDetectorService, PatchGeneratorService,
    ImportExecutorService, ResultReportService,
    ...CommandHandlers, ...QueryHandlers,
  ],
  exports: [IndianValidatorsService, FuzzyMatcherService],
})
export class BulkImportModule {}
