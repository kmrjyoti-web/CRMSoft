import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PriceListsController } from './presentation/price-lists.controller';
import { CreatePriceListHandler } from './application/commands/create-price-list/create-price-list.handler';
import { UpdatePriceListHandler } from './application/commands/update-price-list/update-price-list.handler';
import { DeletePriceListHandler } from './application/commands/delete-price-list/delete-price-list.handler';
import { AddPriceListItemHandler } from './application/commands/add-price-list-item/add-price-list-item.handler';
import { UpdatePriceListItemHandler } from './application/commands/update-price-list-item/update-price-list-item.handler';
import { RemovePriceListItemHandler } from './application/commands/remove-price-list-item/remove-price-list-item.handler';
import { ListPriceListsHandler } from './application/queries/list-price-lists/list-price-lists.handler';
import { GetPriceListHandler } from './application/queries/get-price-list/get-price-list.handler';

const CommandHandlers = [
  CreatePriceListHandler,
  UpdatePriceListHandler,
  DeletePriceListHandler,
  AddPriceListItemHandler,
  UpdatePriceListItemHandler,
  RemovePriceListItemHandler,
];

const QueryHandlers = [ListPriceListsHandler, GetPriceListHandler];

@Module({
  imports: [CqrsModule],
  controllers: [PriceListsController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class PriceListsModule {}
