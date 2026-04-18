"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupOpsModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const backup_service_1 = require("./backup.service");
const backup_cron_1 = require("./backup.cron");
const backup_ops_controller_1 = require("./presentation/backup-ops.controller");
const r2_storage_service_1 = require("../../../shared/infrastructure/storage/r2-storage.service");
let BackupOpsModule = class BackupOpsModule {
};
exports.BackupOpsModule = BackupOpsModule;
exports.BackupOpsModule = BackupOpsModule = __decorate([
    (0, common_1.Module)({
        imports: [schedule_1.ScheduleModule.forRoot()],
        controllers: [backup_ops_controller_1.BackupOpsController],
        providers: [backup_service_1.BackupService, backup_cron_1.BackupCron, r2_storage_service_1.R2StorageService],
        exports: [backup_service_1.BackupService],
    })
], BackupOpsModule);
//# sourceMappingURL=backup.module.js.map