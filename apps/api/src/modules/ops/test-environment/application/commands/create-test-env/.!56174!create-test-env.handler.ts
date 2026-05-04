import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { CreateTestEnvCommand } from './create-test-env.command';
import {
  TEST_ENV_REPOSITORY,
  ITestEnvRepository,
} from '../../../infrastructure/repositories/test-env.repository';
import { PrismaService } from '@core/prisma/prisma.service';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { format } = require('date-fns');

export const TEST_ENV_QUEUE = 'ops-test-environment';

const MAX_ACTIVE_ENVS = 3;

@CommandHandler(CreateTestEnvCommand)
export class CreateTestEnvHandler implements ICommandHandler<CreateTestEnvCommand> {
  private readonly logger = new Logger(CreateTestEnvHandler.name);

  constructor(
    @Inject(TEST_ENV_REPOSITORY)
    private readonly repo: ITestEnvRepository,
    @InjectQueue(TEST_ENV_QUEUE)
    private readonly queue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  async execute(cmd: CreateTestEnvCommand): Promise<{ id: string; name: string }> {
    const { tenantId, userId, sourceType, displayName, backupId, sourceDbUrl, ttlHours } = cmd;

    // Validate: max active environments per tenant
    const activeCount = await this.repo.countActive(tenantId);
    if (activeCount >= MAX_ACTIVE_ENVS) {
      throw new BadRequestException(
        `Maximum ${MAX_ACTIVE_ENVS} active test environments allowed per tenant. ` +
        `Please cleanup an existing one before creating a new one.`,
      );
    }

    // Validate backup_id for BACKUP_RESTORE
    if (sourceType === 'BACKUP_RESTORE' && !backupId) {
      throw new BadRequestException('backupId is required for BACKUP_RESTORE source type');
    }

    // Generate DB name: companyCode_yyyyMMdd_HHmmss
    const companyCode = await this.resolveCompanyCode(tenantId);
    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
    const dbName = `${companyCode}_${timestamp}`.toLowerCase().replace(/[^a-z0-9_]/g, '_');

    // Auto-generate display name if not provided
    const sourceLabel = { SEED_DATA: 'Seed Test', LIVE_CLONE: 'Live Clone', BACKUP_RESTORE: 'Backup Restore' };
    const dateLabel = format(new Date(), 'MMM d, yyyy HH:mm');
