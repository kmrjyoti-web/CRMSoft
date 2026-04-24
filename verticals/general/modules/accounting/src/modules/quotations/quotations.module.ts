import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Controllers
import { QuotationsController } from './presentation/quotations.controller';
import { QuotationAnalyticsController } from './presentation/quotation-analytics.controller';
import { QuotationAiController } from './presentation/quotation-ai.controller';
import { QuotationTemplatesController } from './presentation/quotation-templates.controller';

// Services
import { QuotationCalculatorService } from './services/quotation-calculator.service';
import { QuotationNumberService } from './services/quotation-number.service';
import { QuotationAnalyticsService } from './services/quotation-analytics.service';
import { QuotationPredictionService } from './services/quotation-prediction.service';
import { QuotationExpiryService } from './services/quotation-expiry.service';

// Command handlers
import { CreateQuotationHandler } from './application/commands/create-quotation/create-quotation.handler';
import { UpdateQuotationHandler } from './application/commands/update-quotation/update-quotation.handler';
import { AddLineItemHandler } from './application/commands/add-line-item/add-line-item.handler';
import { UpdateLineItemHandler } from './application/commands/update-line-item/update-line-item.handler';
import { RemoveLineItemHandler } from './application/commands/remove-line-item/remove-line-item.handler';
import { RecalculateTotalsHandler } from './application/commands/recalculate-totals/recalculate-totals.handler';
import { SendQuotationHandler } from './application/commands/send-quotation/send-quotation.handler';
import { MarkViewedHandler } from './application/commands/mark-viewed/mark-viewed.handler';
import { AcceptQuotationHandler } from './application/commands/accept-quotation/accept-quotation.handler';
import { RejectQuotationHandler } from './application/commands/reject-quotation/reject-quotation.handler';
import { ReviseQuotationHandler } from './application/commands/revise-quotation/revise-quotation.handler';
import { CancelQuotationHandler } from './application/commands/cancel-quotation/cancel-quotation.handler';
import { CloneQuotationHandler } from './application/commands/clone-quotation/clone-quotation.handler';
import { LogNegotiationHandler } from './application/commands/log-negotiation/log-negotiation.handler';
import { CreateFromTemplateHandler } from './application/commands/create-from-template/create-from-template.handler';
import { AiGenerateQuotationHandler } from './application/commands/ai-generate-quotation/ai-generate-quotation.handler';

// Query handlers
import { GetQuotationByIdHandler } from './application/queries/get-quotation-by-id/get-quotation-by-id.handler';
import { ListQuotationsHandler } from './application/queries/list-quotations/list-quotations.handler';
import { GetQuotationTimelineHandler } from './application/queries/get-quotation-timeline/get-quotation-timeline.handler';
import { GetQuotationVersionsHandler } from './application/queries/get-quotation-versions/get-quotation-versions.handler';
import { GetNegotiationHistoryHandler } from './application/queries/get-negotiation-history/get-negotiation-history.handler';
import { GetTemplatesHandler } from './application/queries/get-templates/get-templates.handler';
import { GetQuotationAnalyticsHandler } from './application/queries/get-quotation-analytics/get-quotation-analytics.handler';
import { GetProductAnalyticsHandler } from './application/queries/get-product-analytics/get-product-analytics.handler';
import { GetIndustryAnalyticsHandler } from './application/queries/get-industry-analytics/get-industry-analytics.handler';
import { GetBestQuotationsHandler } from './application/queries/get-best-quotations/get-best-quotations.handler';
import { GetQuotationComparisonHandler } from './application/queries/get-quotation-comparison/get-quotation-comparison.handler';
import { GetPredictionMatrixHandler } from './application/queries/get-prediction-matrix/get-prediction-matrix.handler';

const CommandHandlers = [
  CreateQuotationHandler, UpdateQuotationHandler,
  AddLineItemHandler, UpdateLineItemHandler, RemoveLineItemHandler,
  RecalculateTotalsHandler, SendQuotationHandler, MarkViewedHandler,
  AcceptQuotationHandler, RejectQuotationHandler, ReviseQuotationHandler,
  CancelQuotationHandler, CloneQuotationHandler, LogNegotiationHandler,
  CreateFromTemplateHandler, AiGenerateQuotationHandler,
];

const QueryHandlers = [
  GetQuotationByIdHandler, ListQuotationsHandler,
  GetQuotationTimelineHandler, GetQuotationVersionsHandler,
  GetNegotiationHistoryHandler, GetTemplatesHandler,
  GetQuotationAnalyticsHandler, GetProductAnalyticsHandler,
  GetIndustryAnalyticsHandler, GetBestQuotationsHandler,
  GetQuotationComparisonHandler, GetPredictionMatrixHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [
    QuotationsController,
    QuotationAnalyticsController,
    QuotationAiController,
    QuotationTemplatesController,
  ],
  providers: [
    QuotationCalculatorService,
    QuotationNumberService,
    QuotationAnalyticsService,
    QuotationPredictionService,
    QuotationExpiryService,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [QuotationCalculatorService, QuotationNumberService],
})
export class QuotationsModule {}
