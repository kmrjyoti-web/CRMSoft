import {
  Controller, Get, Post, Body, Param, Query, Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreditNoteService } from '../services/credit-note.service';
import { CreateCreditNoteDto, ApplyCreditNoteDto, CreditNoteQueryDto } from './dto/credit-note.dto';

@ApiTags('Credit Notes')
@Controller('api/v1/credit-notes')
export class CreditNoteController {
  constructor(private readonly creditNoteService: CreditNoteService) {}

  /** Create credit note */
  @Post()
  create(@Req() req: any, @Body() dto: CreateCreditNoteDto) {
    return this.creditNoteService.create(req.user.tenantId, dto, req.user.id);
  }

  /** Issue credit note */
  @Post(':id/issue')
  issue(@Req() req: any, @Param('id') id: string) {
    return this.creditNoteService.issue(req.user.tenantId, id, req.user.id);
  }

  /** Apply credit note to invoice */
  @Post(':id/apply')
  apply(@Req() req: any, @Param('id') id: string, @Body() dto: ApplyCreditNoteDto) {
    return this.creditNoteService.apply(req.user.tenantId, id, dto);
  }

  /** Cancel credit note */
  @Post(':id/cancel')
  cancel(@Req() req: any, @Param('id') id: string) {
    return this.creditNoteService.cancel(req.user.tenantId, id);
  }

  /** List credit notes */
  @Get()
  list(@Req() req: any, @Query() query: CreditNoteQueryDto) {
    return this.creditNoteService.list(req.user.tenantId, query);
  }

  /** Get credit note by ID */
  @Get(':id')
  getById(@Req() req: any, @Param('id') id: string) {
    return this.creditNoteService.getById(req.user.tenantId, id);
  }
}
