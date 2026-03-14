import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { VendorGuard } from '../../tenant/infrastructure/vendor.guard';
import { ApiResponse } from '../../../common/utils/api-response';
import { SupportTicketService } from '../services/support-ticket.service';

@ApiTags('Vendor Support')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, VendorGuard)
@Controller('vendor/support/tickets')
export class VendorSupportController {
  constructor(private readonly ticketService: SupportTicketService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get support ticket stats' })
  async getStats() {
    const result = await this.ticketService.getStats();
    return ApiResponse.success(result);
  }

  @Get()
  @ApiOperation({ summary: 'List all support tickets (vendor view)' })
  async list(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('tenantId') tenantId?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('category') category?: string,
    @Query('assignedToId') assignedToId?: string,
  ) {
    const result = await this.ticketService.findAll({
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
      tenantId,
      status,
      priority,
      category,
      assignedToId,
    });
    return ApiResponse.success(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket detail (vendor view)' })
  async getById(@Param('id') id: string) {
    const ticket = await this.ticketService.findById(id);
    if (!ticket) return ApiResponse.error('Ticket not found');
    return ApiResponse.success(ticket);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update ticket status/assignment/priority' })
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      status?: string;
      assignedToId?: string;
      assignedToName?: string;
      priority?: string;
    },
  ) {
    const result = await this.ticketService.updateTicket(id, body);
    return ApiResponse.success(result);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Add vendor message/internal note' })
  async addMessage(
    @Param('id') id: string,
    @Body()
    body: { message: string; attachments?: string[]; isInternal?: boolean },
    @Req() req: any,
  ) {
    const result = await this.ticketService.addMessage(id, {
      senderId: req.user.id,
      senderName: req.user.name || req.user.email,
      senderType: 'VENDOR',
      message: body.message,
      attachments: body.attachments,
      isInternal: body.isInternal,
    });
    return ApiResponse.success(result);
  }

  @Get(':id/context')
  @ApiOperation({ summary: 'Get auto-captured context and linked errors' })
  async getContext(@Param('id') id: string) {
    const result = await this.ticketService.getContext(id);
    if (!result) return ApiResponse.error('Ticket not found');
    return ApiResponse.success(result);
  }
}
