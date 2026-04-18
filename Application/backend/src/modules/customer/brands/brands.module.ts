import { Module } from '@nestjs/common';
import { BrandsController } from './presentation/brands.controller';

@Module({
  controllers: [BrandsController],
})
export class BrandsModule {}
