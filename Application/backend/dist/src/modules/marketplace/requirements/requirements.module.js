"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequirementsModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const requirements_controller_1 = require("./presentation/requirements.controller");
const mkt_prisma_service_1 = require("./infrastructure/mkt-prisma.service");
const post_requirement_handler_1 = require("./application/commands/post-requirement/post-requirement.handler");
const submit_quote_handler_1 = require("./application/commands/submit-quote/submit-quote.handler");
const accept_quote_handler_1 = require("./application/commands/accept-quote/accept-quote.handler");
const reject_quote_handler_1 = require("./application/commands/reject-quote/reject-quote.handler");
const list_requirements_handler_1 = require("./application/queries/list-requirements/list-requirements.handler");
const get_requirement_quotes_handler_1 = require("./application/queries/get-requirement-quotes/get-requirement-quotes.handler");
const CommandHandlers = [
    post_requirement_handler_1.PostRequirementHandler,
    submit_quote_handler_1.SubmitQuoteHandler,
    accept_quote_handler_1.AcceptQuoteHandler,
    reject_quote_handler_1.RejectQuoteHandler,
];
const QueryHandlers = [
    list_requirements_handler_1.ListRequirementsHandler,
    get_requirement_quotes_handler_1.GetRequirementQuotesHandler,
];
let RequirementsModule = class RequirementsModule {
};
exports.RequirementsModule = RequirementsModule;
exports.RequirementsModule = RequirementsModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [requirements_controller_1.RequirementsController],
        providers: [mkt_prisma_service_1.MktPrismaService, ...CommandHandlers, ...QueryHandlers],
    })
], RequirementsModule);
//# sourceMappingURL=requirements.module.js.map