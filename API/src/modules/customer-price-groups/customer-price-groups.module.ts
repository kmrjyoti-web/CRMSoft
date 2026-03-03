import { Module } from '@nestjs/common';
import { CustomerPriceGroupsController } from './presentation/customer-price-groups.controller';

@Module({
  controllers: [CustomerPriceGroupsController],
})
export class CustomerPriceGroupsModule {}
