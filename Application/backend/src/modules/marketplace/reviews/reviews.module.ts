import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ReviewsController } from './presentation/reviews.controller';
import { MktPrismaService } from './infrastructure/mkt-prisma.service';
import { CreateReviewHandler } from './application/commands/create-review/create-review.handler';
import { ModerateReviewHandler } from './application/commands/moderate-review/moderate-review.handler';
import { ListReviewsHandler } from './application/queries/list-reviews/list-reviews.handler';

const CommandHandlers = [CreateReviewHandler, ModerateReviewHandler];
const QueryHandlers = [ListReviewsHandler];

@Module({
  imports: [CqrsModule],
  controllers: [ReviewsController],
  providers: [MktPrismaService, ...CommandHandlers, ...QueryHandlers],
})
export class ReviewsModule {}
