import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { ApiKeyService } from '../services/api-key.service';
import { CreateApiKeyDto, UpdateApiKeyScopesDto, RevokeApiKeyDto } from './dto/api-key.dto';

@Controller('api-gateway/admin/api-keys')
@UseGuards(JwtAuthGuard)
export class ApiKeyAdminController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreateApiKeyDto) {
    return this.apiKeyService.create(
      req.user.tenantId,
      dto,
      req.user.id,
      `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim(),
    );
  }

  @Get()
  async list(@Req() req: any) {
    return this.apiKeyService.listByTenant(req.user.tenantId);
  }

  @Get('scopes')
  getAvailableScopes() {
    return this.apiKeyService.getAvailableScopes();
  }

  @Get(':id')
  async getById(@Req() req: any, @Param('id') id: string) {
    return this.apiKeyService.getById(req.user.tenantId, id);
  }

  @Put(':id/scopes')
  async updateScopes(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateApiKeyScopesDto) {
    return this.apiKeyService.updateScopes(req.user.tenantId, id, dto.scopes);
  }

  @Post(':id/revoke')
  async revoke(@Req() req: any, @Param('id') id: string, @Body() dto: RevokeApiKeyDto) {
    await this.apiKeyService.revoke(req.user.tenantId, id, dto.reason, req.user.id);
    return { message: 'API key revoked' };
  }

  @Post(':id/regenerate')
  async regenerate(@Req() req: any, @Param('id') id: string) {
    return this.apiKeyService.regenerate(
      req.user.tenantId,
      id,
      req.user.id,
      `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim(),
    );
  }
}
