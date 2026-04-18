"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const bull_1 = require("@nestjs/bull");
const analytics_controller_1 = require("./presentation/analytics.controller");
const mkt_prisma_service_1 = require("./infrastructure/mkt-prisma.service");
const track_event_handler_1 = require("./application/commands/track-event/track-event.handler");
const get_analytics_handler_1 = require("./application/queries/get-analytics/get-analytics.handler");
const analytics_aggregator_processor_1 = require("./application/jobs/analytics-aggregator.processor");
const CommandHandlers = [track_event_handler_1.TrackEventHandler];
const QueryHandlers = [get_analytics_handler_1.GetAnalyticsHandler];
let AnalyticsModule = class AnalyticsModule {
};
exports.AnalyticsModule = AnalyticsModule;
exports.AnalyticsModule = AnalyticsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cqrs_1.CqrsModule,
            bull_1.BullModule.registerQueue({ name: analytics_aggregator_processor_1.ANALYTICS_QUEUE }),
        ],
        controllers: [analytics_controller_1.AnalyticsController],
        providers: [
            mkt_prisma_service_1.MktPrismaService,
            ...CommandHandlers,
            ...QueryHandlers,
            analytics_aggregator_processor_1.AnalyticsAggregatorProcessor,
        ],
    })
], AnalyticsModule);
//# sourceMappingURL=analytics.module.js.map