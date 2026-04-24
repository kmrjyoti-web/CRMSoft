import { Module } from '@nestjs/common';
import { SalesController } from './presentation/sales.controller';
import { SaleOrderService } from './services/sale-order.service';
import { DeliveryChallanService } from './services/delivery-challan.service';
import { SaleReturnService } from './services/sale-return.service';
import { CreditNoteEnhancedService } from './services/credit-note-enhanced.service';
import { DebitNoteService } from './services/debit-note.service';

@Module({
  controllers: [SalesController],
  providers: [
    SaleOrderService,
    DeliveryChallanService,
    SaleReturnService,
    CreditNoteEnhancedService,
    DebitNoteService,
  ],
  exports: [SaleOrderService, DeliveryChallanService],
})
export class SalesModule {}
