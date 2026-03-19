import {
  Controller, Get, Post, Put, Param, Body,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SubscribeCommand } from '../application/commands/subscribe/subscribe.command';
import { ChangePlanCommand } from '../application/commands/change-plan/change-plan.command';
import { CancelSubscriptionCommand } from '../application/commands/cancel-subscription/cancel-subscription.command';
import { CompleteOnboardingStepCommand } from '../application/commands/complete-onboarding-step/complete-onboarding-step.command';
import { GetSubscriptionQuery } from '../application/queries/get-subscription/query';
import { GetTenantUsageQuery } from '../application/queries/get-tenant-usage/query';
import { ListPlansQuery } from '../application/queries/list-plans/query';
import { SubscribeDto } from './dto/subscribe.dto';
import { ChangePlanDto } from './dto/change-plan.dto';
import { OnboardingStepDto } from './dto/onboarding-step.dto';
import { UpsertTenantProfileDto } from './dto/upsert-tenant-profile.dto';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Public } from '../../../../common/decorators/roles.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { LimitCheckerService } from '../services/limit-checker.service';
import { UsageTrackerService } from '../services/usage-tracker.service';
import { TenantProfileService } from '../services/tenant-profile.service';

@ApiTags('Subscription')
@ApiBearerAuth()
@Controller('tenant/subscription')
export class SubscriptionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly limitChecker: LimitCheckerService,
    private readonly usageTracker: UsageTrackerService,
    private readonly tenantProfileService: TenantProfileService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get current subscription details' })
  async getCurrent(@CurrentUser('tenantId') tenantId: string) {
    const subscription = await this.queryBus.execute(new GetSubscriptionQuery(tenantId));
    return ApiResponse.success(subscription);
  }

  @Post('subscribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Subscribe to a plan' })
  async subscribe(
    @Body() dto: SubscribeDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.commandBus.execute(
      new SubscribeCommand(tenantId, dto.planId),
    );
    return ApiResponse.success(result, 'Subscribed successfully');
  }

  @Post('change-plan')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change current subscription plan' })
  async changePlan(
    @Body() dto: ChangePlanDto,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.commandBus.execute(
      new ChangePlanCommand(tenantId, dto.newPlanId),
    );
    return ApiResponse.success(result, 'Plan changed successfully');
  }

  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel current subscription' })
  async cancel(@CurrentUser('tenantId') tenantId: string) {
    const subscription = await this.queryBus.execute(new GetSubscriptionQuery(tenantId));
    const result = await this.commandBus.execute(
      new CancelSubscriptionCommand(subscription.id, tenantId),
    );
    return ApiResponse.success(result, 'Subscription cancelled');
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get current tenant usage statistics' })
  async getUsage(@CurrentUser('tenantId') tenantId: string) {
    const usage = await this.queryBus.execute(new GetTenantUsageQuery(tenantId));
    return ApiResponse.success(usage);
  }

  @Post('onboarding/:step')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete an onboarding step' })
  async completeOnboardingStep(
    @Param('step') step: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const result = await this.commandBus.execute(
      new CompleteOnboardingStepCommand(tenantId, step as any),
    );
    return ApiResponse.success(result, 'Onboarding step completed');
  }

  @Get('limits')
  @ApiOperation({ summary: 'Get current plan limits with usage' })
  async getLimitsWithUsage(@CurrentUser('tenantId') tenantId: string) {
    const result = await this.limitChecker.getAllLimitsWithUsage(tenantId);
    return ApiResponse.success(result);
  }

  @Get('usage-detail')
  @ApiOperation({ summary: 'Get detailed usage breakdown per resource' })
  async getUsageDetail(@CurrentUser('tenantId') tenantId: string) {
    const details = await this.usageTracker.getUsageDetails(tenantId);
    return ApiResponse.success(details);
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update own tenant profile (for onboarding)' })
  async updateProfile(
    @CurrentUser('tenantId') tenantId: string,
    @Body() body: UpsertTenantProfileDto,
  ) {
    const profile = await this.tenantProfileService.upsert(tenantId, body);
    return ApiResponse.success(profile, 'Profile updated');
  }

  @Get('plans')
  @Public()
  @ApiOperation({ summary: 'List available plans (public)' })
  async listPlans() {
    const plans = await this.queryBus.execute(new ListPlansQuery(true));
    return ApiResponse.success(plans);
  }
}
