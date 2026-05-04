import { Module } from '@nestjs/common';
import { InventoryController } from './presentation/inventory.controller';
import { InventoryLabelsController } from './presentation/inventory-labels.controller';
import { BOMController } from './presentation/bom.controller';
import { InventoryService } from './services/inventory.service';
import { SerialService } from './services/serial.service';
import { TransactionService } from './services/transaction.service';
import { LocationService } from './services/location.service';
import { AdjustmentService } from './services/adjustment.service';
import { InventoryReportService } from './services/report.service';
import { InventoryLabelService } from './services/label.service';
import { BOMFormulaService } from './services/bom-formula.service';
import { BOMCalculationService } from './services/bom-calculation.service';
import { BOMProductionService } from './services/bom-production.service';
import { ScrapService } from './services/scrap.service';
import { BOMReportService } from './services/bom-report.service';

@Module({
  controllers: [InventoryController, InventoryLabelsController, BOMController],
  providers: [
    InventoryService,
    SerialService,
    TransactionService,
    LocationService,
    AdjustmentService,
    InventoryReportService,
    InventoryLabelService,
    BOMFormulaService,
    BOMCalculationService,
    BOMProductionService,
    ScrapService,
    BOMReportService,
  ],
  exports: [InventoryService, SerialService, TransactionService, BOMFormulaService, BOMCalculationService],
})
export class InventoryModule {}
