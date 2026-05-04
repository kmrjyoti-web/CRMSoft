import { Module } from '@nestjs/common';
import { ProductTaxController } from './presentation/product-tax.controller';
import { ProductTaxGstCalculatorService } from './services/gst-calculator.service';

@Module({
  controllers: [ProductTaxController],
  providers: [ProductTaxGstCalculatorService],
  exports: [ProductTaxGstCalculatorService],
})
export class ProductTaxModule {}
