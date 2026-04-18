"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestRunnerModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const bull_1 = require("@nestjs/bull");
const test_runner_controller_1 = require("./presentation/test-runner.controller");
const test_error_controller_1 = require("./presentation/test-error.controller");
const test_report_controller_1 = require("./presentation/test-report.controller");
const test_orchestrator_service_1 = require("./application/services/test-orchestrator.service");
const test_error_analyzer_service_1 = require("./infrastructure/services/test-error-analyzer.service");
const test_run_processor_1 = require("./application/jobs/test-run.processor");
const unit_test_runner_1 = require("./infrastructure/runners/unit-test.runner");
const functional_test_runner_1 = require("./infrastructure/runners/functional-test.runner");
const smoke_test_runner_1 = require("./infrastructure/runners/smoke-test.runner");
const architecture_test_runner_1 = require("./infrastructure/runners/architecture-test.runner");
const penetration_test_runner_1 = require("./infrastructure/runners/penetration-test.runner");
const integration_test_runner_1 = require("./infrastructure/runners/integration-test.runner");
const test_run_repository_1 = require("./infrastructure/repositories/test-run.repository");
const create_test_run_handler_1 = require("./application/commands/create-test-run/create-test-run.handler");
const rerun_failed_tests_handler_1 = require("./application/commands/rerun-failed-tests/rerun-failed-tests.handler");
const cancel_test_run_handler_1 = require("./application/commands/cancel-test-run/cancel-test-run.handler");
const list_test_runs_handler_1 = require("./application/queries/list-test-runs/list-test-runs.handler");
const get_test_run_handler_1 = require("./application/queries/get-test-run/get-test-run.handler");
const get_test_results_handler_1 = require("./application/queries/get-test-results/get-test-results.handler");
const get_test_results_tree_handler_1 = require("./application/queries/get-test-results-tree/get-test-results-tree.handler");
const compare_test_runs_handler_1 = require("./application/queries/compare-test-runs/compare-test-runs.handler");
const get_test_dashboard_handler_1 = require("./application/queries/get-test-dashboard/get-test-dashboard.handler");
const CommandHandlers = [create_test_run_handler_1.CreateTestRunHandler, rerun_failed_tests_handler_1.RerunFailedTestsHandler, cancel_test_run_handler_1.CancelTestRunHandler];
const QueryHandlers = [list_test_runs_handler_1.ListTestRunsHandler, get_test_run_handler_1.GetTestRunHandler, get_test_results_handler_1.GetTestResultsHandler, get_test_results_tree_handler_1.GetTestResultsTreeHandler, compare_test_runs_handler_1.CompareTestRunsHandler, get_test_dashboard_handler_1.GetTestDashboardHandler];
let TestRunnerModule = class TestRunnerModule {
};
exports.TestRunnerModule = TestRunnerModule;
exports.TestRunnerModule = TestRunnerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cqrs_1.CqrsModule,
            bull_1.BullModule.registerQueue({ name: test_run_processor_1.TEST_RUNNER_QUEUE }),
        ],
        controllers: [test_runner_controller_1.TestRunnerController, test_error_controller_1.TestErrorController, test_report_controller_1.TestReportController],
        providers: [
            test_orchestrator_service_1.TestOrchestratorService,
            test_error_analyzer_service_1.TestErrorAnalyzerService,
            test_run_processor_1.TestRunProcessor,
            unit_test_runner_1.UnitTestRunner,
            functional_test_runner_1.FunctionalTestRunner,
            smoke_test_runner_1.SmokeTestRunner,
            architecture_test_runner_1.ArchitectureTestRunner,
            penetration_test_runner_1.PenetrationTestRunner,
            integration_test_runner_1.IntegrationTestRunner,
            ...CommandHandlers,
            ...QueryHandlers,
            { provide: test_run_repository_1.TEST_RUN_REPOSITORY, useClass: test_run_repository_1.PrismaTestRunRepository },
        ],
        exports: [test_orchestrator_service_1.TestOrchestratorService, test_error_analyzer_service_1.TestErrorAnalyzerService],
    })
], TestRunnerModule);
//# sourceMappingURL=test-runner.module.js.map