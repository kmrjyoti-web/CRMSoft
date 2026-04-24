import { Module } from '@nestjs/common';
import { SupportTicketService } from './services/support-ticket.service';
import { TicketContextService } from './services/ticket-context.service';
import { SupportTicketController } from './presentation/support-ticket.controller';
import { VendorSupportController } from './presentation/vendor-support.controller';

@Module({
  controllers: [SupportTicketController, VendorSupportController],
  providers: [SupportTicketService, TicketContextService],
  exports: [SupportTicketService],
})
export class SupportModule {}
