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
var ScalingCron_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScalingCron = void 0;
const common_1 = require("@nestjs/common");
const scaling_service_1 = require("./scaling.service");
let ScalingCron = ScalingCron_1 = class ScalingCron {
    scalingService;
    logger = new common_1.Logger(ScalingCron_1.name);
    evaluationInterval;
    constructor(scalingService) {
        this.scalingService = scalingService;
    }
    onModuleInit() {
        const FIFTEEN_MINUTES = 15 * 60 * 1000;
        this.evaluationInterval = setInterval(async () => {
            this.logger.log('Running auto-scaling evaluation...');
            try {
                await this.scalingService.evaluateAll();
            }
            catch (err) {
                this.logger.error('Auto-scaling evaluation failed', err instanceof Error ? err.stack : String(err));
            }
        }, FIFTEEN_MINUTES);
        this.logger.log('Scaling cron started (15-minute intervals)');
    }
    onModuleDestroy() {
        clearInterval(this.evaluationInterval);
    }
};
exports.ScalingCron = ScalingCron;
exports.ScalingCron = ScalingCron = ScalingCron_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [scaling_service_1.ScalingService])
], ScalingCron);
//# sourceMappingURL=scaling.cron.js.map