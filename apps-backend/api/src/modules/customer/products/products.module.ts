import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ProductsController } from './presentation/products.controller';

// Command Handlers
import { CreateProductHandler } from './application/commands/create-product/create-product.handler';
import { UpdateProductHandler } from './application/commands/update-product/update-product.handler';
import { ManageProductImagesHandler } from './application/commands/manage-product-images/manage-product-images.handler';
import { LinkProductsHandler } from './application/commands/link-products/link-products.handler';
import { DeactivateProductHandler } from './application/commands/deactivate-product/deactivate-product.handler';
import { AssignProductFiltersHandler } from './application/commands/assign-product-filters/assign-product-filters.handler';

// Query Handlers
import { GetProductByIdHandler } from './application/queries/get-product-by-id/get-product-by-id.handler';
import { ListProductsHandler } from './application/queries/list-products/list-products.handler';
import { GetProductTreeHandler } from './application/queries/get-product-tree/get-product-tree.handler';
import { GetProductPricingHandler } from './application/queries/get-product-pricing/get-product-pricing.handler';

const CommandHandlers = [
  CreateProductHandler,
  UpdateProductHandler,
  ManageProductImagesHandler,
  LinkProductsHandler,
  DeactivateProductHandler,
  AssignProductFiltersHandler,
];

const QueryHandlers = [
  GetProductByIdHandler,
  ListProductsHandler,
  GetProductTreeHandler,
  GetProductPricingHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [ProductsController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class ProductsModule {}
