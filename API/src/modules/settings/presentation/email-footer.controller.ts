import { Controller, Get, Post, Put, Body, Param, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EmailFooterService } from '../services/email-footer.service';
import { CreateEmailFooterDto, UpdateEmailFooterDto } from './dto/email-footer.dto';

@ApiTags('Settings - Email Footer')
@Controller('api/v1/settings/email-footers')
export class EmailFooterController {
  constructor(private readonly service: EmailFooterService) {}

  /** List all footer templates. */
  @Get()
  list(@Req() req: any) {
    return this.service.list(req.user.tenantId);
  }

  /** Create a footer template. */
  @Post()
  create(@Req() req: any, @Body() dto: CreateEmailFooterDto) {
    return this.service.create(req.user.tenantId, dto);
  }

  /** Update a footer template. */
  @Put(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateEmailFooterDto) {
    return this.service.update(req.user.tenantId, id, dto);
  }
}
