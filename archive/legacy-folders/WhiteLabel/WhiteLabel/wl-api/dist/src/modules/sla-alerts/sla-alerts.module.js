"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlaAlertsModule = void 0;
const common_1 = require("@nestjs/common");
const sla_alerts_service_1 = require("./sla-alerts.service");
const sla_alerts_controller_1 = require("./sla-alerts.controller");
const sla_alerts_cron_1 = require("./sla-alerts.cron");
let SlaAlertsModule = class SlaAlertsModule {
};
exports.SlaAlertsModule = SlaAlertsModule;
exports.SlaAlertsModule = SlaAlertsModule = __decorate([
    (0, common_1.Module)({
        providers: [sla_alerts_service_1.SlaAlertsService, sla_alerts_cron_1.SlaAlertsCron],
        controllers: [sla_alerts_controller_1.SlaAlertsController],
        exports: [sla_alerts_service_1.SlaAlertsService],
    })
], SlaAlertsModule);
//# sourceMappingURL=sla-alerts.module.js.map