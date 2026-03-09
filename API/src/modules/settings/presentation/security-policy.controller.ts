import {
  Controller, Get, Put, Post, Delete, Body, Param, Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SecurityPolicyService } from '../services/security-policy.service';
import { UpdateSecurityPolicyDto, CreateIpRuleDto } from './dto/update-security-policy.dto';

@ApiTags('Settings - Security Policy')
@Controller('settings/security')
export class SecurityPolicyController {
  constructor(private readonly service: SecurityPolicyService) {}

  /** Get full security policy. */
  @Get()
  get(@Req() req: any) {
    return this.service.get(req.user.tenantId);
  }

  /** Update security policy. */
  @Put()
  update(@Req() req: any, @Body() dto: UpdateSecurityPolicyDto) {
    return this.service.update(req.user.tenantId, dto, req.user.id);
  }

  /** Add IP whitelist/blacklist rule. */
  @Post('ip-rules')
  addIpRule(@Req() req: any, @Body() dto: CreateIpRuleDto) {
    return this.service.addIpRule(req.user.tenantId, dto);
  }

  /** Remove IP rule. */
  @Delete('ip-rules/:id')
  removeIpRule(@Param('id') id: string) {
    return this.service.removeIpRule(id);
  }

  /** List IP rules. */
  @Get('ip-rules')
  listIpRules(@Req() req: any) {
    return this.service.listIpRules(req.user.tenantId);
  }
}
