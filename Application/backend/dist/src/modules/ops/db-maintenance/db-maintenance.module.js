"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbMaintenanceModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const db_maintenance_service_1 = require("./db-maintenance.service");
const db_maintenance_cron_1 = require("./db-maintenance.cron");
const db_maintenance_controller_1 = require("./presentation/db-maintenance.controller");
let DbMaintenanceModule = class DbMaintenanceModule {
};
exports.DbMaintenanceModule = DbMaintenanceModule;
exports.DbMaintenanceModule = DbMaintenanceModule = __decorate([
    (0, common_1.Module)({
        imports: [schedule_1.ScheduleModule.forRoot()],
        controllers: [db_maintenance_controller_1.DbMaintenanceController],
        providers: [db_maintenance_service_1.DbMaintenanceService, db_maintenance_cron_1.DbMaintenanceCron],
        exports: [db_maintenance_service_1.DbMaintenanceService],
    })
], DbMaintenanceModule);
//# sourceMappingURL=db-maintenance.module.js.map