import { Controller, Get, Post, Body, Param, Req, HttpCode } from '@nestjs/common';
import { Public } from '../../../../common/decorators/roles.decorator';
import { EntityVerificationService } from '../services/entity-verification.service';
import { ApiResponse } from '../../../../common/utils/api-response';
import { RejectVerificationDto } from './dto/entity-verification.dto';

@Controller('public/entity-verify')
export class PublicEntityVerificationController {
  constructor(private readonly service: EntityVerificationService) {}

  @Public()
  @Get(':token')
  async getPage(@Param('token') token: string) {
    const result = await this.service.getVerificationPage(token);
    return ApiResponse.success(result);
  }

  @Public()
  @Post(':token/confirm')
  @HttpCode(200)
  async confirm(@Param('token') token: string, @Req() req: any) {
    const result = await this.service.confirmVerification(
      token, req.ip ?? '', req.headers['user-agent'] ?? '',
    );
    return ApiResponse.success(result);
  }

  @Public()
  @Post(':token/reject')
  @HttpCode(200)
  async reject(@Param('token') token: string, @Body() dto: RejectVerificationDto, @Req() req: any) {
    const result = await this.service.rejectVerification(token, dto.reason ?? '', req.ip ?? '');
    return ApiResponse.success(result);
  }
}
