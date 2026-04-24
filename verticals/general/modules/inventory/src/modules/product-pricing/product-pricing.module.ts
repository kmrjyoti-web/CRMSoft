import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ProductPricingController } from './presentation/product-pricing.controller';

// Command Handlers
import { SetProductPricesHandler } from './application/commands/set-product-prices/set-product-prices.handler';
import { SetGroupPriceHandler } from './application/commands/set-group-price/set-group-price.handler';
import { SetSlabPriceHandler } from './application/commands/set-slab-price/set-slab-price.handler';

// Query Handlers
import { GetEffectivePriceHandler } from './application/queries/get-effective-price/get-effective-price.handler';
import { GetPriceListHandler } from './application/queries/get-price-list/get-price-list.handler';

const CommandHandlers = [
  SetProductPricesHandler,
  SetGroupPriceHandler,
  SetSlabPriceHandler,
];

const QueryHandlers = [
  GetEffectivePriceHandler,
  GetPriceListHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [ProductPricingController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class ProductPricingModule {}
