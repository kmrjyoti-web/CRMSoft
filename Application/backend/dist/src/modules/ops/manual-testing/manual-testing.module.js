"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManualTestingModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const config_1 = require("@nestjs/config");
const manual_test_controller_1 = require("./presentation/manual-test.controller");
const dev_qa_controller_1 = require("./presentation/dev-qa.controller");
const dev_qa_notion_service_1 = require("./services/dev-qa-notion.service");
const r2_storage_service_1 = require("./infrastructure/services/r2-storage.service");
const manual_test_log_repository_1 = require("./infrastructure/repositories/manual-test-log.repository");
const test_plan_repository_1 = require("./infrastructure/repositories/test-plan.repository");
const log_manual_test_handler_1 = require("./application/commands/log-manual-test/log-manual-test.handler");
const get_screenshot_upload_url_handler_1 = require("./application/commands/get-screenshot-upload-url/get-screenshot-upload-url.handler");
const update_manual_test_log_handler_1 = require("./application/commands/update-manual-test-log/update-manual-test-log.handler");
const create_test_plan_handler_1 = require("./application/commands/create-test-plan/create-test-plan.handler");
const update_test_plan_handler_1 = require("./application/commands/update-test-plan/update-test-plan.handler");
const update_test_plan_item_handler_1 = require("./application/commands/update-test-plan-item/update-test-plan-item.handler");
const list_manual_test_logs_handler_1 = require("./application/queries/list-manual-test-logs/list-manual-test-logs.handler");
const get_manual_test_log_handler_1 = require("./application/queries/get-manual-test-log/get-manual-test-log.handler");
const get_manual_test_summary_handler_1 = require("./application/queries/get-manual-test-summary/get-manual-test-summary.handler");
const list_test_plans_handler_1 = require("./application/queries/list-test-plans/list-test-plans.handler");
const get_test_plan_handler_1 = require("./application/queries/get-test-plan/get-test-plan.handler");
const CommandHandlers = [
    log_manual_test_handler_1.LogManualTestHandler,
    get_screenshot_upload_url_handler_1.GetScreenshotUploadUrlHandler,
    update_manual_test_log_handler_1.UpdateManualTestLogHandler,
    create_test_plan_handler_1.CreateTestPlanHandler,
    update_test_plan_handler_1.UpdateTestPlanHandler,
    update_test_plan_item_handler_1.UpdateTestPlanItemHandler,
];
const QueryHandlers = [
    list_manual_test_logs_handler_1.ListManualTestLogsHandler,
    get_manual_test_log_handler_1.GetManualTestLogHandler,
    get_manual_test_summary_handler_1.GetManualTestSummaryHandler,
    list_test_plans_handler_1.ListTestPlansHandler,
    get_test_plan_handler_1.GetTestPlanHandler,
];
let ManualTestingModule = class ManualTestingModule {
};
exports.ManualTestingModule = ManualTestingModule;
exports.ManualTestingModule = ManualTestingModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule, config_1.ConfigModule],
        controllers: [manual_test_controller_1.ManualTestController, dev_qa_controller_1.DevQAController],
        providers: [
            r2_storage_service_1.R2StorageService,
            dev_qa_notion_service_1.DevQANotionService,
            ...CommandHandlers,
            ...QueryHandlers,
            { provide: manual_test_log_repository_1.MANUAL_TEST_LOG_REPOSITORY, useClass: manual_test_log_repository_1.PrismaManualTestLogRepository },
            { provide: test_plan_repository_1.TEST_PLAN_REPOSITORY, useClass: test_plan_repository_1.PrismaTestPlanRepository },
        ],
        exports: [r2_storage_service_1.R2StorageService],
    })
], ManualTestingModule);
//# sourceMappingURL=manual-testing.module.js.map