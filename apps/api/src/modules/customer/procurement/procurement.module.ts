import { Module } from '@nestjs/common';
import { InventoryModule } from '../../customer/inventory/inventory.module';
import { ProcurementController } from './presentation/procurement.controller';
import { UnitService } from './services/unit.service';
import { RFQService } from './services/rfq.service';
import { PurchaseQuotationService } from './services/purchase-quotation.service';
import { CompareEngineService } from './services/compare-engine.service';
import { PurchaseOrderService } from './services/purchase-order.service';
import { GoodsReceiptService } from './services/goods-receipt.service';
import { PurchaseInvoiceService } from './services/purchase-invoice.service';
import { ProcurementDashboardService } from './services/procurement-dashboard.service';

@Module({
  imports: [InventoryModule],
  controllers: [ProcurementController],
  providers: [
    UnitService,
    RFQService,
    PurchaseQuotationService,
    CompareEngineService,
    PurchaseOrderService,
    GoodsReceiptService,
    PurchaseInvoiceService,
    ProcurementDashboardService,
  ],
  exports: [UnitService, PurchaseOrderService],
})
export class ProcurementModule {}
