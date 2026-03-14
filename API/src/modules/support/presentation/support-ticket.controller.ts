import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ApiResponse } from '../../../common/utils/api-response';
import { SupportTicketService } from '../services/support-ticket.service';
import { TicketContextService } from '../services/ticket-context.service';
import { CreateTicketDto } from './dto/create-ticket.dto';

@ApiTags('Support Tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('support/tickets')
export class SupportTicketController {
  constructor(
    private readonly ticketService: SupportTicketService,
    private readonly contextService: TicketContextService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a support ticket' })
  async create(@Body() body: CreateTicketDto, @Req() req: any) {
    const user = req.user;
    const autoContext = await this.contextService.captureContext(
      user.id,
      user.tenantId,
      req.headers['user-agent'],
      req.headers.referer,
    );

    const ticket = await this.ticketService.create({
      tenantId: user.tenantId,
      reportedById: user.id,
      reportedByName: user.name,
      reportedByEmail: user.email,
      tenantName: user.tenantName,
      subject: body.subject,
      description: body.description,
      category: body.category,
      priority: body.priority,
      screenshots: body.screenshots,
      autoContext,
      linkedErrorIds: body.linkedErrorIds,
    });
    return ApiResponse.success(ticket);
  }

  @Get()
  @ApiOperation({ summary: 'List my tenant tickets' })
  async list(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    const result = await this.ticketService.findByTenant(req.user.tenantId, {
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
      status,
    });
    return ApiResponse.success(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket by ID' })
  async getById(@Param('id') id: string, @Req() req: any) {
    const ticket = await this.ticketService.findById(id);
    if (!ticket || ticket.tenantId !== req.user.tenantId) {
      return ApiResponse.error('Ticket not found');
    }
    // Filter out internal notes for customer view
    const messages = ticket.messages.filter((m) => !m.isInternal);
    return ApiResponse.success({ ...ticket, messages });
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Add message to ticket' })
  async addMessage(
    @Param('id') id: string,
    @Body() body: { message: string; attachments?: string[] },
    @Req() req: any,
  ) {
    const result = await this.ticketService.addMessage(id, {
      senderId: req.user.id,
      senderName: req.user.name,
      senderType: 'CUSTOMER',
      message: body.message,
      attachments: body.attachments,
    });
    return ApiResponse.success(result);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Close ticket' })
  async close(@Param('id') id: string) {
    const result = await this.ticketService.closeTicket(id);
    return ApiResponse.success(result);
  }

  @Post(':id/rate')
  @ApiOperation({ summary: 'Rate resolved ticket' })
  async rate(
    @Param('id') id: string,
    @Body() body: { rating: number; comment?: string },
  ) {
    const result = await this.ticketService.rateTicket(id, body.rating, body.comment);
    return ApiResponse.success(result);
  }
}
