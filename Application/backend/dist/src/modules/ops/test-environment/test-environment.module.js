"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestEnvironmentModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const bull_1 = require("@nestjs/bull");
const schedule_1 = require("@nestjs/schedule");
const config_1 = require("@nestjs/config");
const test_env_controller_1 = require("./presentation/test-env.controller");
const db_operations_service_1 = require("./infrastructure/db-operations.service");
const test_env_processor_1 = require("./application/jobs/test-env.processor");
const test_env_cleanup_cron_1 = require("./application/jobs/test-env-cleanup.cron");
const create_test_env_handler_1 = require("./application/commands/create-test-env/create-test-env.handler");
const cleanup_test_env_handler_1 = require("./application/commands/cleanup-test-env/cleanup-test-env.handler");
const extend_test_env_ttl_handler_1 = require("./application/commands/extend-test-env-ttl/extend-test-env-ttl.handler");
const list_test_envs_handler_1 = require("./application/queries/list-test-envs/list-test-envs.handler");
const get_test_env_handler_1 = require("./application/queries/get-test-env/get-test-env.handler");
const test_env_repository_1 = require("./infrastructure/repositories/test-env.repository");
const CommandHandlers = [create_test_env_handler_1.CreateTestEnvHandler, cleanup_test_env_handler_1.CleanupTestEnvHandler, extend_test_env_ttl_handler_1.ExtendTestEnvTtlHandler];
const QueryHandlers = [list_test_envs_handler_1.ListTestEnvsHandler, get_test_env_handler_1.GetTestEnvHandler];
let TestEnvironmentModule = class TestEnvironmentModule {
};
exports.TestEnvironmentModule = TestEnvironmentModule;
exports.TestEnvironmentModule = TestEnvironmentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cqrs_1.CqrsModule,
            config_1.ConfigModule,
            schedule_1.ScheduleModule.forRoot(),
            bull_1.BullModule.registerQueue({ name: create_test_env_handler_1.TEST_ENV_QUEUE }),
        ],
        controllers: [test_env_controller_1.TestEnvController],
        providers: [
            db_operations_service_1.DbOperationsService,
            test_env_processor_1.TestEnvProcessor,
            test_env_cleanup_cron_1.TestEnvCleanupCron,
            ...CommandHandlers,
            ...QueryHandlers,
            {
                provide: test_env_repository_1.TEST_ENV_REPOSITORY,
                useClass: test_env_repository_1.PrismaTestEnvRepository,
            },
        ],
        exports: [db_operations_service_1.DbOperationsService],
    })
], TestEnvironmentModule);
//# sourceMappingURL=test-environment.module.js.map