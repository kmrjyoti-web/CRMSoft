"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpsModule = void 0;
const common_1 = require("@nestjs/common");
const test_environment_module_1 = require("./test-environment/test-environment.module");
const test_runner_module_1 = require("./test-runner/test-runner.module");
const test_groups_module_1 = require("./test-groups/test-groups.module");
const manual_testing_module_1 = require("./manual-testing/manual-testing.module");
const scheduled_test_module_1 = require("./scheduled-test/scheduled-test.module");
const db_maintenance_module_1 = require("./db-maintenance/db-maintenance.module");
const backup_module_1 = require("./backup/backup.module");
let OpsModule = class OpsModule {
};
exports.OpsModule = OpsModule;
exports.OpsModule = OpsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            test_environment_module_1.TestEnvironmentModule,
            test_runner_module_1.TestRunnerModule,
            test_groups_module_1.TestGroupsModule,
            manual_testing_module_1.ManualTestingModule,
            scheduled_test_module_1.ScheduledTestModule,
            db_maintenance_module_1.DbMaintenanceModule,
            backup_module_1.BackupOpsModule,
        ],
        exports: [
            test_environment_module_1.TestEnvironmentModule,
            test_runner_module_1.TestRunnerModule,
            test_groups_module_1.TestGroupsModule,
            manual_testing_module_1.ManualTestingModule,
            scheduled_test_module_1.ScheduledTestModule,
            db_maintenance_module_1.DbMaintenanceModule,
            backup_module_1.BackupOpsModule,
        ],
    })
], OpsModule);
//# sourceMappingURL=ops.module.js.map