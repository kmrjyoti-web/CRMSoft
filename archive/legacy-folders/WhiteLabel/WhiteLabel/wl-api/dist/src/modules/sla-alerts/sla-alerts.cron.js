"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SlaAlertsCron_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlaAlertsCron = void 0;
const common_1 = require("@nestjs/common");
const sla_alerts_service_1 = require("./sla-alerts.service");
let SlaAlertsCron = SlaAlertsCron_1 = class SlaAlertsCron {
    slaAlertsService;
    logger = new common_1.Logger(SlaAlertsCron_1.name);
    breachInterval;
    overdueInterval;
    constructor(slaAlertsService) {
        this.slaAlertsService = slaAlertsService;
    }
    onModuleInit() {
        const ONE_HOUR = 60 * 60 * 1000;
        this.breachInterval = setInterval(async () => {
            this.logger.log('Running SLA breach check...');
            try {
                await this.slaAlertsService.checkSlaBreaches();
                await this.slaAlertsService.checkUpcomingBreaches();
            }
            catch (err) {
                this.logger.error('SLA breach check failed', err instanceof Error ? err.stack : String(err));
            }
        }, ONE_HOUR);
        this.overdueInterval = setInterval(async () => {
            this.logger.log('Running payment overdue check...');
            try {
                await this.slaAlertsService.checkPaymentOverdue();
            }
            catch (err) {
                this.logger.error('Payment overdue check failed', err instanceof Error ? err.stack : String(err));
            }
        }, ONE_HOUR);
        this.logger.log('SLA alerts cron started (hourly intervals)');
    }
    onModuleDestroy() {
        clearInterval(this.breachInterval);
        clearInterval(this.overdueInterval);
    }
};
exports.SlaAlertsCron = SlaAlertsCron;
exports.SlaAlertsCron = SlaAlertsCron = SlaAlertsCron_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sla_alerts_service_1.SlaAlertsService])
], SlaAlertsCron);
//# sourceMappingURL=sla-alerts.cron.js.map