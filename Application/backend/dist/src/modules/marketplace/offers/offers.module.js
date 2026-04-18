"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OffersModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const bull_1 = require("@nestjs/bull");
const offers_controller_1 = require("./presentation/offers.controller");
const mkt_prisma_service_1 = require("./infrastructure/mkt-prisma.service");
const create_offer_handler_1 = require("./application/commands/create-offer/create-offer.handler");
const activate_offer_handler_1 = require("./application/commands/activate-offer/activate-offer.handler");
const redeem_offer_handler_1 = require("./application/commands/redeem-offer/redeem-offer.handler");
const get_offer_handler_1 = require("./application/queries/get-offer/get-offer.handler");
const list_offers_handler_1 = require("./application/queries/list-offers/list-offers.handler");
const check_eligibility_handler_1 = require("./application/queries/check-eligibility/check-eligibility.handler");
const offer_scheduler_processor_1 = require("./application/jobs/offer-scheduler.processor");
const CommandHandlers = [create_offer_handler_1.CreateOfferHandler, activate_offer_handler_1.ActivateOfferHandler, redeem_offer_handler_1.RedeemOfferHandler];
const QueryHandlers = [get_offer_handler_1.GetOfferHandler, list_offers_handler_1.ListOffersHandler, check_eligibility_handler_1.CheckEligibilityHandler];
let OffersModule = class OffersModule {
};
exports.OffersModule = OffersModule;
exports.OffersModule = OffersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cqrs_1.CqrsModule,
            bull_1.BullModule.registerQueue({ name: offer_scheduler_processor_1.OFFER_SCHEDULER_QUEUE }),
        ],
        controllers: [offers_controller_1.OffersController],
        providers: [
            mkt_prisma_service_1.MktPrismaService,
            ...CommandHandlers,
            ...QueryHandlers,
            offer_scheduler_processor_1.OfferSchedulerProcessor,
        ],
        exports: [mkt_prisma_service_1.MktPrismaService],
    })
], OffersModule);
//# sourceMappingURL=offers.module.js.map