"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const reviews_controller_1 = require("./presentation/reviews.controller");
const mkt_prisma_service_1 = require("./infrastructure/mkt-prisma.service");
const create_review_handler_1 = require("./application/commands/create-review/create-review.handler");
const moderate_review_handler_1 = require("./application/commands/moderate-review/moderate-review.handler");
const list_reviews_handler_1 = require("./application/queries/list-reviews/list-reviews.handler");
const CommandHandlers = [create_review_handler_1.CreateReviewHandler, moderate_review_handler_1.ModerateReviewHandler];
const QueryHandlers = [list_reviews_handler_1.ListReviewsHandler];
let ReviewsModule = class ReviewsModule {
};
exports.ReviewsModule = ReviewsModule;
exports.ReviewsModule = ReviewsModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [reviews_controller_1.ReviewsController],
        providers: [mkt_prisma_service_1.MktPrismaService, ...CommandHandlers, ...QueryHandlers],
    })
], ReviewsModule);
//# sourceMappingURL=reviews.module.js.map