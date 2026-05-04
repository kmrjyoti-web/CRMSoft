import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EnquiriesController } from './presentation/enquiries.controller';
import { MktPrismaService } from './infrastructure/mkt-prisma.service';
import { CreateEnquiryHandler } from './application/commands/create-enquiry/create-enquiry.handler';
import { ConvertEnquiryHandler } from './application/commands/convert-enquiry/convert-enquiry.handler';
import { ListEnquiriesHandler } from './application/queries/list-enquiries/list-enquiries.handler';

const CommandHandlers = [CreateEnquiryHandler, ConvertEnquiryHandler];
const QueryHandlers = [ListEnquiriesHandler];

@Module({
  imports: [CqrsModule],
  controllers: [EnquiriesController],
  providers: [MktPrismaService, ...CommandHandlers, ...QueryHandlers],
})
export class EnquiriesModule {}
