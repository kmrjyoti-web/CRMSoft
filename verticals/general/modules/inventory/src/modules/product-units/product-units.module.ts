import { Module } from '@nestjs/common';
import { ProductUnitsController } from './presentation/product-units.controller';
import { UnitConverterService } from './services/unit-converter.service';

@Module({
  controllers: [ProductUnitsController],
  providers: [UnitConverterService],
  exports: [UnitConverterService],
})
export class ProductUnitsModule {}
