"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduledTestModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const bull_1 = require("@nestjs/bull");
const scheduled_test_controller_1 = require("./presentation/scheduled-test.controller");
const backup_controller_1 = require("./presentation/backup.controller");
const create_scheduled_test_handler_1 = require("./application/commands/create-scheduled-test/create-scheduled-test.handler");
const update_scheduled_test_handler_1 = require("./application/commands/update-scheduled-test/update-scheduled-test.handler");
const delete_scheduled_test_handler_1 = require("./application/commands/delete-scheduled-test/delete-scheduled-test.handler");
const trigger_scheduled_test_handler_1 = require("./application/commands/trigger-scheduled-test/trigger-scheduled-test.handler");
const list_scheduled_tests_handler_1 = require("./application/queries/list-scheduled-tests/list-scheduled-tests.handler");
const get_scheduled_test_handler_1 = require("./application/queries/get-scheduled-test/get-scheduled-test.handler");
const list_scheduled_test_runs_handler_1 = require("./application/queries/list-scheduled-test-runs/list-scheduled-test-runs.handler");
const scheduled_test_cron_1 = require("./application/jobs/scheduled-test.cron");
const scheduled_test_processor_1 = require("./application/jobs/scheduled-test.processor");
const scheduled_test_repository_1 = require("./infrastructure/repositories/scheduled-test.repository");
const scheduled_test_run_repository_1 = require("./infrastructure/repositories/scheduled-test-run.repository");
const backup_record_repository_1 = require("./infrastructure/repositories/backup-record.repository");
const backup_validation_service_1 = require("./infrastructure/services/backup-validation.service");
const test_runner_module_1 = require("../test-runner/test-runner.module");
const db_operations_service_1 = require("../test-environment/infrastructure/db-operations.service");
const CommandHandlers = [
    create_scheduled_test_handler_1.CreateScheduledTestHandler,
    update_scheduled_test_handler_1.UpdateScheduledTestHandler,
    delete_scheduled_test_handler_1.DeleteScheduledTestHandler,
    trigger_scheduled_test_handler_1.TriggerScheduledTestHandler,
];
const QueryHandlers = [
    list_scheduled_tests_handler_1.ListScheduledTestsHandler,
    get_scheduled_test_handler_1.GetScheduledTestHandler,
    list_scheduled_test_runs_handler_1.ListScheduledTestRunsHandler,
];
let ScheduledTestModule = class ScheduledTestModule {
};
exports.ScheduledTestModule = ScheduledTestModule;
exports.ScheduledTestModule = ScheduledTestModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cqrs_1.CqrsModule,
            bull_1.BullModule.registerQueue({ name: scheduled_test_processor_1.SCHEDULED_TEST_QUEUE }),
            test_runner_module_1.TestRunnerModule,
        ],
        controllers: [scheduled_test_controller_1.ScheduledTestController, backup_controller_1.BackupController],
        providers: [
            backup_validation_service_1.BackupValidationService,
            db_operations_service_1.DbOperationsService,
            scheduled_test_cron_1.ScheduledTestCron,
            scheduled_test_processor_1.ScheduledTestProcessor,
            ...CommandHandlers,
            ...QueryHandlers,
            { provide: scheduled_test_repository_1.SCHEDULED_TEST_REPOSITORY, useClass: scheduled_test_repository_1.PrismaScheduledTestRepository },
            { provide: scheduled_test_run_repository_1.SCHEDULED_TEST_RUN_REPOSITORY, useClass: scheduled_test_run_repository_1.PrismaScheduledTestRunRepository },
            { provide: backup_record_repository_1.BACKUP_RECORD_REPOSITORY, useClass: backup_record_repository_1.PrismaBackupRecordRepository },
        ],
        exports: [backup_validation_service_1.BackupValidationService],
    })
], ScheduledTestModule);
//# sourceMappingURL=scheduled-test.module.js.map