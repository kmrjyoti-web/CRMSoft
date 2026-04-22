import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { AssignOwnerCommand } from '../application/commands/assign-owner/assign-owner.command';
import { TransferOwnerCommand } from '../application/commands/transfer-owner/transfer-owner.command';
import { RevokeOwnerCommand } from '../application/commands/revoke-owner/revoke-owner.command';
import { DelegateOwnershipCommand } from '../application/commands/delegate-ownership/delegate-ownership.command';
import { RevertDelegationCommand } from '../application/commands/revert-delegation/revert-delegation.command';
import { BulkAssignCommand } from '../application/commands/bulk-assign/bulk-assign.command';
import { BulkTransferCommand } from '../application/commands/bulk-transfer/bulk-transfer.command';
import { GetEntityOwnersQuery } from '../application/queries/get-entity-owners/get-entity-owners.query';
import { GetUserEntitiesQuery } from '../application/queries/get-user-entities/get-user-entities.query';
import { GetOwnershipHistoryQuery } from '../application/queries/get-ownership-history/get-ownership-history.query';
import { GetUnassignedEntitiesQuery } from '../application/queries/get-unassigned-entities/get-unassigned-entities.query';
import { GetReassignmentPreviewQuery } from '../application/queries/get-reassignment-preview/get-reassignment-preview.query';
import { GetDelegationStatusQuery } from '../application/queries/get-delegation-status/get-delegation-status.query';
import { AssignOwnerDto } from './dto/assign-owner.dto';
import { TransferOwnerDto } from './dto/transfer-owner.dto';
import { DelegateOwnershipDto } from './dto/delegate-ownership.dto';
import { BulkAssignDto } from './dto/bulk-assign.dto';
import { BulkTransferDto } from './dto/bulk-transfer.dto';
import { OwnershipCoreService } from '../services/ownership-core.service';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

@Controller('ownership')
@UseGuards(AuthGuard('jwt'))
export class OwnershipController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly ownershipCore: OwnershipCoreService,
  ) {}

  @Post('assign')
  @RequirePermissions('ownership:create')
  async assign(@Body() dto: AssignOwnerDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new AssignOwnerCommand(
      dto.entityType, dto.entityId, dto.userId, dto.ownerType,
      userId, dto.reason, dto.reasonDetail, dto.method,
      dto.validFrom ? new Date(dto.validFrom) : undefined,
      dto.validTo ? new Date(dto.validTo) : undefined,
    ));
    return ApiResponse.success(result, 'Owner assigned');
  }

  @Post('transfer')
  @RequirePermissions('ownership:update')
  async transfer(@Body() dto: TransferOwnerDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new TransferOwnerCommand(
      dto.entityType, dto.entityId, dto.fromUserId, dto.toUserId,
      dto.ownerType, userId, dto.reason, dto.reasonDetail,
    ));
    return ApiResponse.success(result, 'Ownership transferred');
  }

  @Post('revoke')
  @RequirePermissions('ownership:delete')
  async revoke(@Body() dto: AssignOwnerDto, @CurrentUser('id') userId: string) {
    await this.commandBus.execute(new RevokeOwnerCommand(
      dto.entityType, dto.entityId, dto.userId, dto.ownerType, userId, dto.reason,
    ));
    return ApiResponse.success(null, 'Ownership revoked');
  }

  @Post('delegate')
  @RequirePermissions('ownership:create')
  async delegate(@Body() dto: DelegateOwnershipDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new DelegateOwnershipCommand(
      dto.fromUserId, dto.toUserId, new Date(dto.startDate), new Date(dto.endDate),
      dto.reason, userId, dto.entityType,
    ));
    return ApiResponse.success(result, 'Ownership delegated');
  }

  @Post('revert-delegation/:id')
  @RequirePermissions('ownership:update')
  async revertDelegation(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new RevertDelegationCommand(id, userId));
    return ApiResponse.success(result, 'Delegation reverted');
  }

  @Post('bulk-assign')
  @RequirePermissions('ownership:create')
  async bulkAssign(@Body() dto: BulkAssignDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new BulkAssignCommand(
      dto.entityType, dto.entityIds, dto.userId, dto.ownerType, dto.reason, userId,
    ));
    return ApiResponse.success(result, 'Bulk assignment complete');
  }

  @Post('bulk-transfer')
  @RequirePermissions('ownership:update')
  async bulkTransfer(@Body() dto: BulkTransferDto, @CurrentUser('id') userId: string) {
    const result = await this.commandBus.execute(new BulkTransferCommand(
      dto.fromUserId, dto.toUserId, userId, dto.reason, dto.reasonDetail, dto.entityType,
    ));
    return ApiResponse.success(result, 'Bulk transfer complete');
  }

  @Get('entity/:entityType/:entityId')
  @RequirePermissions('ownership:read')
  async getEntityOwners(@Param('entityType') entityType: string, @Param('entityId') entityId: string) {
    const result = await this.queryBus.execute(new GetEntityOwnersQuery(entityType, entityId));
    return ApiResponse.success(result);
  }

  @Get('user/:userId')
  @RequirePermissions('ownership:read')
  async getUserEntities(@Param('userId') userId: string, @Query() query: any) {
    const result = await this.queryBus.execute(new GetUserEntitiesQuery(userId, query.entityType, query.ownerType));
    return ApiResponse.success(result);
  }

  @Get('history/:entityType/:entityId')
  @RequirePermissions('ownership:read')
  async getHistory(@Param('entityType') entityType: string, @Param('entityId') entityId: string, @Query() query: PaginationDto) {
    const result = await this.queryBus.execute(new GetOwnershipHistoryQuery(entityType, entityId, query.page, query.limit));
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('unassigned')
  @RequirePermissions('ownership:read')
  async getUnassigned(@Query() query: any) {
    const result = await this.queryBus.execute(new GetUnassignedEntitiesQuery(query.entityType || 'LEAD', query.page, query.limit));
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('reassignment-preview/:fromUserId')
  @RequirePermissions('ownership:read')
  async getReassignmentPreview(@Param('fromUserId') fromUserId: string, @Query() query: any) {
    const result = await this.queryBus.execute(new GetReassignmentPreviewQuery(fromUserId, query.toUserId, query.entityType));
    return ApiResponse.success(result);
  }

  @Get('my-entities')
  @RequirePermissions('ownership:read')
  async getMyEntities(@CurrentUser('id') userId: string, @Query() query: any) {
    const result = await this.queryBus.execute(new GetUserEntitiesQuery(userId, query.entityType, query.ownerType));
    return ApiResponse.success(result);
  }

  @Get('stats')
  @RequirePermissions('ownership:read')
  async getStats() {
    const result = await this.ownershipCore.getUserEntities({ userId: '', isActive: true });
    return ApiResponse.success(result.summary);
  }

  @Get('recent-changes')
  @RequirePermissions('ownership:read')
  async getRecentChanges(@Query() query: PaginationDto) {
    const result = await this.ownershipCore.getHistory({ entityType: '', entityId: '', page: query.page, limit: query.limit });
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  @Get('delegation-status')
  @RequirePermissions('ownership:read')
  async getDelegationStatus(@Query() query: any) {
    const result = await this.queryBus.execute(new GetDelegationStatusQuery(query.userId, query.isActive === 'true'));
    return ApiResponse.success(result);
  }
}
