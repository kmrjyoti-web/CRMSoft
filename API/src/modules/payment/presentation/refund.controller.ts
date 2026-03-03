import {
  Controller, Get, Post, Body, Param, Query, Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RefundService } from '../services/refund.service';
import { CreateRefundDto, RefundQueryDto } from './dto/refund.dto';

@ApiTags('Refunds')
@Controller('api/v1/refunds')
export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  /** Initiate a refund */
  @Post()
  create(@Req() req: any, @Body() dto: CreateRefundDto) {
    return this.refundService.create(req.user.tenantId, dto, req.user.id);
  }

  /** List refunds */
  @Get()
  list(@Req() req: any, @Query() query: RefundQueryDto) {
    return this.refundService.list(req.user.tenantId, query);
  }

  /** Get refund by ID */
  @Get(':id')
  getById(@Req() req: any, @Param('id') id: string) {
    return this.refundService.getById(req.user.tenantId, id);
  }
}
