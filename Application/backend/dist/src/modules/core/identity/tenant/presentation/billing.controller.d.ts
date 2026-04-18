import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { InvoiceQueryDto } from './dto/invoice-query.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { InvoiceGeneratorService } from '../services/invoice-generator.service';
import { ApiResponse } from '../../../../../common/utils/api-response';
export declare class BillingController {
    private readonly commandBus;
    private readonly queryBus;
    private readonly invoiceGenerator;
    constructor(commandBus: CommandBus, queryBus: QueryBus, invoiceGenerator: InvoiceGeneratorService);
    listInvoices(query: InvoiceQueryDto, tenantId: string): Promise<ApiResponse<unknown[]>>;
    downloadInvoice(id: string): Promise<ApiResponse<{
        pdfUrl: string;
    }>>;
    razorpayWebhook(dto: PaymentWebhookDto): Promise<ApiResponse<null>>;
    recalculateUsage(tenantId: string): Promise<ApiResponse<null>>;
}
