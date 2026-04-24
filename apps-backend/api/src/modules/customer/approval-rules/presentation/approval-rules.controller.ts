import {
  Controller, Post, Get, Put, Delete, Param, Body,
} from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateApprovalRuleDto, UpdateApprovalRuleDto } from './dto/approval-rule.dto';

@Controller('approval-rules')
@RequirePermissions('permissions:manage')
export class ApprovalRulesController {
  constructor(private readonly prisma: PrismaService) {}

  /** POST / — Create approval rule. */
  @Post()
  async create(@Body() dto: CreateApprovalRuleDto) {
    const rule = await this.prisma.working.approvalRule.create({
      data: {
        entityType: dto.entityType,
        action: dto.action,
        checkerRole: dto.checkerRole,
        minCheckers: dto.minCheckers ?? 1,
        skipForRoles: dto.skipForRoles ?? [],
        amountField: dto.amountField,
        amountThreshold: dto.amountThreshold,
        expiryHours: dto.expiryHours ?? 48,
      },
    });
    return ApiResponse.success(rule, 'Approval rule created');
  }

  /** GET / — List all rules. */
  @Get()
  async list() {
    const rules = await this.prisma.working.approvalRule.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return ApiResponse.success(rules);
  }

  /** PUT /:id — Update rule. */
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateApprovalRuleDto) {
    const rule = await this.prisma.working.approvalRule.update({
      where: { id },
      data: dto,
    });
    return ApiResponse.success(rule, 'Approval rule updated');
  }

  /** DELETE /:id — Delete rule. */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.prisma.working.approvalRule.delete({ where: { id } });
    return ApiResponse.success(null, 'Approval rule deleted');
  }
}
