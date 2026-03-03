import { Module } from '@nestjs/common';
import { ProductTaxController } from './presentation/product-tax.controller';
import { GstCalculatorService } from './services/gst-calculator.service';

@Module({
  controllers: [ProductTaxController],
  providers: [GstCalculatorService],
  exports: [GstCalculatorService],
})
export class ProductTaxModule {}
