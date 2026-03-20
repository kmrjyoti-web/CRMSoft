import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ListingsController } from './presentation/listings.controller';
import { MktPrismaService } from '../infrastructure/mkt-prisma.service';
import { CreateListingHandler } from './application/commands/create-listing/create-listing.handler';
import { UpdateListingHandler } from './application/commands/update-listing/update-listing.handler';
import { PublishListingHandler } from './application/commands/publish-listing/publish-listing.handler';
import { GetListingHandler } from './application/queries/get-listing/get-listing.handler';
import { ListListingsHandler } from './application/queries/list-listings/list-listings.handler';

const CommandHandlers = [CreateListingHandler, UpdateListingHandler, PublishListingHandler];
const QueryHandlers = [GetListingHandler, ListListingsHandler];

@Module({
  imports: [CqrsModule],
  controllers: [ListingsController],
  providers: [MktPrismaService, ...CommandHandlers, ...QueryHandlers],
  exports: [MktPrismaService],
})
export class ListingsModule {}
