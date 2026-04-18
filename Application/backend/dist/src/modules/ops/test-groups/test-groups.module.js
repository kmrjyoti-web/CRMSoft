"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestGroupsModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const bull_1 = require("@nestjs/bull");
const config_1 = require("@nestjs/config");
const test_groups_controller_1 = require("./presentation/test-groups.controller");
const test_group_runner_service_1 = require("./application/services/test-group-runner.service");
const test_group_processor_1 = require("./application/jobs/test-group.processor");
const test_group_repository_1 = require("./infrastructure/repositories/test-group.repository");
const create_test_group_handler_1 = require("./application/commands/create-test-group/create-test-group.handler");
const update_test_group_handler_1 = require("./application/commands/update-test-group/update-test-group.handler");
const delete_test_group_handler_1 = require("./application/commands/delete-test-group/delete-test-group.handler");
const run_test_group_handler_1 = require("./application/commands/run-test-group/run-test-group.handler");
const list_test_groups_handler_1 = require("./application/queries/list-test-groups/list-test-groups.handler");
const get_test_group_handler_1 = require("./application/queries/get-test-group/get-test-group.handler");
const list_group_executions_handler_1 = require("./application/queries/list-group-executions/list-group-executions.handler");
const get_group_execution_handler_1 = require("./application/queries/get-group-execution/get-group-execution.handler");
const CommandHandlers = [create_test_group_handler_1.CreateTestGroupHandler, update_test_group_handler_1.UpdateTestGroupHandler, delete_test_group_handler_1.DeleteTestGroupHandler, run_test_group_handler_1.RunTestGroupHandler];
const QueryHandlers = [list_test_groups_handler_1.ListTestGroupsHandler, get_test_group_handler_1.GetTestGroupHandler, list_group_executions_handler_1.ListGroupExecutionsHandler, get_group_execution_handler_1.GetGroupExecutionHandler];
let TestGroupsModule = class TestGroupsModule {
};
exports.TestGroupsModule = TestGroupsModule;
exports.TestGroupsModule = TestGroupsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cqrs_1.CqrsModule,
            config_1.ConfigModule,
            bull_1.BullModule.registerQueue({ name: test_group_processor_1.TEST_GROUP_QUEUE }),
        ],
        controllers: [test_groups_controller_1.TestGroupsController],
        providers: [
            test_group_runner_service_1.TestGroupRunnerService,
            test_group_processor_1.TestGroupProcessor,
            ...CommandHandlers,
            ...QueryHandlers,
            { provide: test_group_repository_1.TEST_GROUP_REPOSITORY, useClass: test_group_repository_1.PrismaTestGroupRepository },
        ],
        exports: [test_group_runner_service_1.TestGroupRunnerService],
    })
], TestGroupsModule);
//# sourceMappingURL=test-groups.module.js.map