"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkImportModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const platform_express_1 = require("@nestjs/platform-express");
const import_controller_1 = require("./presentation/import.controller");
const profile_controller_1 = require("./presentation/profile.controller");
const file_parser_service_1 = require("./services/file-parser.service");
const indian_validators_service_1 = require("./services/indian-validators.service");
const fuzzy_matcher_service_1 = require("./services/fuzzy-matcher.service");
const profile_matcher_service_1 = require("./services/profile-matcher.service");
const field_mapper_service_1 = require("./services/field-mapper.service");
const row_validator_service_1 = require("./services/row-validator.service");
const duplicate_detector_service_1 = require("./services/duplicate-detector.service");
const patch_generator_service_1 = require("./services/patch-generator.service");
const import_executor_service_1 = require("./services/import-executor.service");
const result_report_service_1 = require("./services/result-report.service");
const upload_file_handler_1 = require("./application/commands/upload-file/upload-file.handler");
const select_profile_handler_1 = require("./application/commands/select-profile/select-profile.handler");
const apply_mapping_handler_1 = require("./application/commands/apply-mapping/apply-mapping.handler");
const save_profile_handler_1 = require("./application/commands/save-profile/save-profile.handler");
const validate_rows_handler_1 = require("./application/commands/validate-rows/validate-rows.handler");
const commit_import_handler_1 = require("./application/commands/commit-import/commit-import.handler");
const cancel_import_handler_1 = require("./application/commands/cancel-import/cancel-import.handler");
const row_action_handler_1 = require("./application/commands/row-action/row-action.handler");
const row_bulk_action_handler_1 = require("./application/commands/row-bulk-action/row-bulk-action.handler");
const edit_row_handler_1 = require("./application/commands/edit-row/edit-row.handler");
const revalidate_row_handler_1 = require("./application/commands/revalidate-row/revalidate-row.handler");
const create_profile_handler_1 = require("./application/commands/create-profile/create-profile.handler");
const update_profile_handler_1 = require("./application/commands/update-profile/update-profile.handler");
const delete_profile_handler_1 = require("./application/commands/delete-profile/delete-profile.handler");
const clone_profile_handler_1 = require("./application/commands/clone-profile/clone-profile.handler");
const get_job_list_handler_1 = require("./application/queries/get-job-list/get-job-list.handler");
const get_job_detail_handler_1 = require("./application/queries/get-job-detail/get-job-detail.handler");
const get_validation_summary_handler_1 = require("./application/queries/get-validation-summary/get-validation-summary.handler");
const get_duplicates_handler_1 = require("./application/queries/get-duplicates/get-duplicates.handler");
const get_job_result_handler_1 = require("./application/queries/get-job-result/get-job-result.handler");
const get_job_rows_handler_1 = require("./application/queries/get-job-rows/get-job-rows.handler");
const get_row_detail_handler_1 = require("./application/queries/get-row-detail/get-row-detail.handler");
const get_mapping_suggestions_handler_1 = require("./application/queries/get-mapping-suggestions/get-mapping-suggestions.handler");
const get_profile_list_handler_1 = require("./application/queries/get-profile-list/get-profile-list.handler");
const get_profile_detail_handler_1 = require("./application/queries/get-profile-detail/get-profile-detail.handler");
const CommandHandlers = [
    upload_file_handler_1.UploadFileHandler, select_profile_handler_1.SelectProfileHandler, apply_mapping_handler_1.ApplyMappingHandler,
    save_profile_handler_1.SaveProfileHandler, validate_rows_handler_1.ValidateRowsHandler, commit_import_handler_1.CommitImportHandler,
    cancel_import_handler_1.CancelImportHandler, row_action_handler_1.RowActionHandler, row_bulk_action_handler_1.RowBulkActionHandler,
    edit_row_handler_1.EditRowHandler, revalidate_row_handler_1.RevalidateRowHandler,
    create_profile_handler_1.CreateProfileHandler, update_profile_handler_1.UpdateProfileHandler, delete_profile_handler_1.DeleteProfileHandler, clone_profile_handler_1.CloneProfileHandler,
];
const QueryHandlers = [
    get_job_list_handler_1.GetJobListHandler, get_job_detail_handler_1.GetJobDetailHandler, get_validation_summary_handler_1.GetValidationSummaryHandler,
    get_duplicates_handler_1.GetDuplicatesHandler, get_job_result_handler_1.GetJobResultHandler, get_job_rows_handler_1.GetJobRowsHandler,
    get_row_detail_handler_1.GetRowDetailHandler, get_mapping_suggestions_handler_1.GetMappingSuggestionsHandler,
    get_profile_list_handler_1.GetProfileListHandler, get_profile_detail_handler_1.GetProfileDetailHandler,
];
let BulkImportModule = class BulkImportModule {
};
exports.BulkImportModule = BulkImportModule;
exports.BulkImportModule = BulkImportModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cqrs_1.CqrsModule,
            platform_express_1.MulterModule.register({ storage: undefined }),
        ],
        controllers: [import_controller_1.ImportController, profile_controller_1.ProfileController],
        providers: [
            file_parser_service_1.FileParserService, indian_validators_service_1.IndianValidatorsService, fuzzy_matcher_service_1.FuzzyMatcherService,
            profile_matcher_service_1.ProfileMatcherService, field_mapper_service_1.FieldMapperService, row_validator_service_1.RowValidatorService,
            duplicate_detector_service_1.DuplicateDetectorService, patch_generator_service_1.PatchGeneratorService,
            import_executor_service_1.ImportExecutorService, result_report_service_1.ResultReportService,
            ...CommandHandlers, ...QueryHandlers,
        ],
        exports: [indian_validators_service_1.IndianValidatorsService, fuzzy_matcher_service_1.FuzzyMatcherService],
    })
], BulkImportModule);
//# sourceMappingURL=bulk-import.module.js.map