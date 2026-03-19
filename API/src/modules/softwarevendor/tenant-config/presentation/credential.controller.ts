import {
  Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CredentialProvider } from '@prisma/client';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { CredentialService } from '../services/credential.service';
import { CredentialVerifierService } from '../services/credential-verifier.service';
import { TokenRefresherService } from '../services/token-refresher.service';
import { CredentialSchemaService } from '../services/credential-schema.service';
import { UpsertCredentialDto } from './dto/upsert-credential.dto';
import { UpdateCredentialDto } from './dto/update-credential.dto';
import { CredentialLogQueryDto } from './dto/credential-log-query.dto';

@ApiTags('Credentials')
@ApiBearerAuth()
@Controller('credentials')
@UseGuards(AuthGuard('jwt'))
export class CredentialController {
  constructor(
    private readonly credentialService: CredentialService,
    private readonly verifier: CredentialVerifierService,
    private readonly tokenRefresher: TokenRefresherService,
    private readonly schemaService: CredentialSchemaService,
  ) {}

  @Get()
  async list(@CurrentUser('tenantId') tenantId: string) {
    const credentials = await this.credentialService.listForTenant(tenantId);
    return ApiResponse.success(credentials, 'Credentials retrieved');
  }

  @Get('status')
  async getStatusSummary(@CurrentUser('tenantId') tenantId: string) {
    const summary = await this.credentialService.getStatusSummary(tenantId);
    return ApiResponse.success(summary, 'Status summary retrieved');
  }

  @Get('schemas')
  async getAllSchemas() {
    const schemas = this.schemaService.getAllSchemas();
    return ApiResponse.success(schemas, 'Schemas retrieved');
  }

  @Get('schemas/:provider')
  async getSchema(@Param('provider') provider: CredentialProvider) {
    const schema = this.schemaService.getSchema(provider);
    return ApiResponse.success(schema, 'Schema retrieved');
  }

  @Get('logs')
  async getAccessLogs(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: CredentialLogQueryDto,
  ) {
    const result = await this.credentialService.getAccessLogs(tenantId, {
      credentialId: query.credentialId,
      action: query.action,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
      page: query.page,
      limit: query.limit,
    });
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get(':id')
  async getDetail(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    const detail = await this.credentialService.getDetail(tenantId, id);
    return ApiResponse.success(detail, 'Credential detail retrieved');
  }

  @Get(':id/logs')
  async getCredentialLogs(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') credentialId: string,
    @Query() query: CredentialLogQueryDto,
  ) {
    const result = await this.credentialService.getAccessLogs(tenantId, {
      credentialId,
      page: query.page,
      limit: query.limit,
    });
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Post()
  async upsert(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('name') userName: string,
    @Body() dto: UpsertCredentialDto,
  ) {
    const result = await this.credentialService.upsert(tenantId, {
      provider: dto.provider,
      instanceName: dto.instanceName,
      credentials: dto.credentials,
      description: dto.description,
      isPrimary: dto.isPrimary,
      dailyUsageLimit: dto.dailyUsageLimit,
      linkedAccountEmail: dto.linkedAccountEmail,
      webhookUrl: dto.webhookUrl,
      userId,
      userName,
    });

    // Auto-verify after upsert
    try {
      await this.verifier.verify(tenantId, result.id);
    } catch {}

    return ApiResponse.success({ id: result.id }, 'Credential saved and verification initiated');
  }

  @Put(':id')
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('name') userName: string,
    @Param('id') id: string,
    @Body() dto: UpdateCredentialDto,
  ) {
    const existing = await this.credentialService.getDetail(tenantId, id);

    if (dto.credentials) {
      await this.credentialService.upsert(tenantId, {
        provider: existing.provider,
        instanceName: existing.instanceName ?? undefined,
        credentials: dto.credentials,
        description: dto.description ?? existing.description ?? undefined,
        isPrimary: dto.isPrimary ?? existing.isPrimary,
        dailyUsageLimit: dto.dailyUsageLimit ?? existing.dailyUsageLimit ?? undefined,
        userId,
        userName,
      });
    }

    return ApiResponse.success(null, 'Credential updated');
  }

  @Delete(':id')
  async revoke(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('name') userName: string,
    @Param('id') id: string,
  ) {
    await this.credentialService.revoke(tenantId, id, userId, userName);
    return ApiResponse.success(null, 'Credential revoked');
  }

  @Post(':id/verify')
  async verify(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    const result = await this.verifier.verify(tenantId, id);
    return ApiResponse.success(result, result.success ? 'Verification passed' : 'Verification failed');
  }

  @Post(':id/refresh')
  async refresh(@Param('id') id: string) {
    const result = await this.tokenRefresher.refreshToken(id);
    return ApiResponse.success(result, result.success ? 'Token refreshed' : 'Refresh failed');
  }
}
