import {
  Controller, Get, Patch, Delete, Param, Body, Query, UseGuards, Req, BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { ControlRoomService } from '../services/control-room.service';
import { RuleResolverService } from '../services/rule-resolver.service';
import { UpdateRuleDto, ResetRuleDto, RuleQueryDto, AuditQueryDto } from './dto/control-room.dto';

@ApiTags('Control Room')
@ApiBearerAuth()
@Controller('control-room')
@UseGuards(AuthGuard('jwt'))
export class ControlRoomController {
  constructor(
    private readonly controlRoomService: ControlRoomService,
    private readonly ruleResolver: RuleResolverService,
  ) {}

  /**
   * GET / — All rules grouped by category with effective values.
   * Used by the Control Room admin UI.
   */
  @Get()
  @RequirePermissions('settings:read')
  async getRulesGrouped(@CurrentUser('tenantId') tenantId: string) {
    const grouped = await this.controlRoomService.getRulesGrouped(tenantId);
    return ApiResponse.success(grouped, 'Rules retrieved');
  }

  /**
   * GET /resolve-all — Resolve ALL rules for the current user.
   * Returns a flat map for IndexedDB bulk load.
   */
  @Get('resolve-all')
  async resolveAllRules(@CurrentUser() user: any) {
    const { tenantId, id: userId, roleIds = [], industryCode } = user;
    const rules = await this.ruleResolver.resolveAllRules(
      tenantId,
      userId,
      Array.isArray(roleIds) ? roleIds : [roleIds].filter(Boolean),
      industryCode,
    );
    return ApiResponse.success(rules, 'All rules resolved');
  }

  /**
   * GET /cache-version — Current cache version number.
   * Frontend polls this to detect stale IndexedDB data.
   */
  @Get('cache-version')
  async getCacheVersion(@CurrentUser('tenantId') tenantId: string) {
    const result = await this.ruleResolver.getCacheVersion(tenantId);
    return ApiResponse.success(result, 'Cache version retrieved');
  }

  /**
   * GET /resolve/:ruleCode — Resolve a single rule for current user.
   */
  @Get('resolve/:ruleCode')
  async resolveRule(
    @CurrentUser() user: any,
    @Param('ruleCode') ruleCode: string,
    @Query('pageCode') pageCode?: string,
  ) {
    const { tenantId, id: userId, roleIds = [], industryCode } = user;
    const resolved = await this.ruleResolver.resolveRule(tenantId, ruleCode, {
      userId,
      roleIds: Array.isArray(roleIds) ? roleIds : [roleIds].filter(Boolean),
      pageCode,
      industryCode,
    });

    if (!resolved) {
      return ApiResponse.error(`Rule '${ruleCode}' not found`);
    }

    return ApiResponse.success(resolved, 'Rule resolved');
  }

  /**
   * PATCH /rules/:ruleCode — Update (upsert) a rule value at a given level.
   */
  @Patch('rules/:ruleCode')
  @RequirePermissions('settings:update')
  async updateRule(
    @CurrentUser() user: any,
    @Param('ruleCode') ruleCode: string,
    @Body() dto: UpdateRuleDto,
    @Req() req: any,
  ) {
    const result = await this.controlRoomService.updateRule(
      user.tenantId,
      ruleCode,
      dto.value,
      dto.level,
      {
        userId: user.id,
        userName: user.name ?? user.email,
        ipAddress: req.ip,
        pageCode: dto.pageCode,
        roleId: dto.roleId,
        targetUserId: dto.userId,
        changeReason: dto.changeReason,
      },
    );
    return ApiResponse.success(result, `Rule '${ruleCode}' updated`);
  }

  /**
   * DELETE /rules/:ruleCode/reset — Remove a level's override (revert to next lower level).
   */
  @Delete('rules/:ruleCode/reset')
  @RequirePermissions('settings:update')
  async resetRule(
    @CurrentUser() user: any,
    @Param('ruleCode') ruleCode: string,
    @Body() dto: ResetRuleDto,
    @Req() req: any,
  ) {
    const result = await this.controlRoomService.resetRule(
      user.tenantId,
      ruleCode,
      dto.level,
      {
        userId: user.id,
        userName: user.name ?? user.email,
        ipAddress: req.ip,
        pageCode: dto.pageCode,
        roleId: dto.roleId,
        targetUserId: dto.userId,
        changeReason: dto.changeReason,
      },
    );
    return ApiResponse.success(result, `Rule '${ruleCode}' reset at level '${dto.level}'`);
  }

  /**
   * GET /audit — Audit trail for all rules (paginated).
   */
  @Get('audit')
  @RequirePermissions('settings:read')
  async getAuditTrail(
    @CurrentUser('tenantId') tenantId: string,
    @Query() query: AuditQueryDto,
  ) {
    const result = await this.controlRoomService.getAuditTrail(tenantId, undefined, {
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 50,
      level: query.level,
      changedByUserId: query.changedByUserId,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    });
    return ApiResponse.success(result.data, 'Audit trail retrieved', result.meta);
  }

  /**
   * GET /audit/:ruleCode — Audit trail for a specific rule.
   */
  @Get('audit/:ruleCode')
  @RequirePermissions('settings:read')
  async getAuditTrailForRule(
    @CurrentUser('tenantId') tenantId: string,
    @Param('ruleCode') ruleCode: string,
    @Query() query: AuditQueryDto,
  ) {
    const result = await this.controlRoomService.getAuditTrail(tenantId, ruleCode, {
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 50,
      level: query.level,
      changedByUserId: query.changedByUserId,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    });
    return ApiResponse.success(result.data, 'Audit trail retrieved', result.meta);
  }

  // ═══════════════════════════════════════
  // DRAFT MODE ENDPOINTS
  // ═══════════════════════════════════════

  @Patch('draft/:ruleCode')
  @RequirePermissions('settings:update')
  async saveDraft(
    @Param('ruleCode') ruleCode: string,
    @Body() dto: UpdateRuleDto,
    @CurrentUser() user: any,
  ) {
    const result = await this.controlRoomService.saveDraft(
      user.tenantId, ruleCode, dto.value, dto.level || 'CONTROL_ROOM',
      { userId: user.id, userName: `${user.firstName} ${user.lastName}`, ipAddress: '' },
    );
    return ApiResponse.success(result, 'Draft saved');
  }

  @Get('drafts')
  @RequirePermissions('settings:read')
  async getPendingDrafts(@CurrentUser() user: any) {
    const drafts = await this.controlRoomService.getPendingDrafts(user.tenantId);
    return ApiResponse.success(drafts);
  }

  @Delete('draft/:draftId')
  @RequirePermissions('settings:update')
  async discardDraft(@Param('draftId') draftId: string, @CurrentUser() user: any) {
    await this.controlRoomService.discardDraft(user.tenantId, draftId);
    return ApiResponse.success({ discarded: true });
  }

  @Delete('drafts/all')
  @RequirePermissions('settings:update')
  async discardAllDrafts(@CurrentUser() user: any) {
    await this.controlRoomService.discardAllDrafts(user.tenantId);
    return ApiResponse.success({ discarded: true });
  }

  @Patch('apply')
  @RequirePermissions('settings:update')
  async applyAllDrafts(
    @Body() body: { changeReason: string },
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    if (!body.changeReason?.trim()) {
      throw new BadRequestException('Change reason is required');
    }
    const result = await this.controlRoomService.applyAllDrafts(user.tenantId, {
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      changeReason: body.changeReason,
      ipAddress: req.ip,
    });
    return ApiResponse.success(result, `${result.appliedCount} changes applied`);
  }
}
