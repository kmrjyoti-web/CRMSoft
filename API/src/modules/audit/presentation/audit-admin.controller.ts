import { Controller, Get, Put, Post, Param, Body, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { UpdateRetentionPolicyDto } from './dto/retention-policy.dto';
import { GetRetentionPoliciesQuery } from '../application/queries/get-retention-policies/get-retention-policies.query';
import { UpdateRetentionPolicyCommand } from '../application/commands/update-retention-policy/update-retention-policy.command';
import { CleanupOldLogsCommand } from '../application/commands/cleanup-old-logs/cleanup-old-logs.command';
import { AuditCleanupService } from '../services/audit-cleanup.service';
import { AuditSkip } from '../decorators/audit-skip.decorator';

@Controller('admin/audit')
@UseGuards(JwtAuthGuard)
@AuditSkip()
export class AuditAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly cleanupService: AuditCleanupService,
  ) {}

  @Get('retention-policies')
  @RequirePermissions('audit:admin')
  async listPolicies() {
    const result = await this.queryBus.execute(new GetRetentionPoliciesQuery());
    return ApiResponse.success(result);
  }

  @Put('retention-policies/:entityType')
  @RequirePermissions('audit:admin')
  async updatePolicy(@Param('entityType') entityType: string, @Body() dto: UpdateRetentionPolicyDto) {
    const result = await this.commandBus.execute(
      new UpdateRetentionPolicyCommand(entityType, dto.retentionDays, dto.archiveEnabled, dto.isActive),
    );
    return ApiResponse.success(result, 'Retention policy updated');
  }

  @Post('cleanup')
  @RequirePermissions('audit:admin')
  async cleanup() {
    const result = await this.commandBus.execute(new CleanupOldLogsCommand());
    return ApiResponse.success(result, 'Cleanup completed');
  }

  @Get('cleanup-preview')
  @RequirePermissions('audit:admin')
  async cleanupPreview() {
    const result = await this.cleanupService.getCleanupPreview();
    return ApiResponse.success(result);
  }
}
