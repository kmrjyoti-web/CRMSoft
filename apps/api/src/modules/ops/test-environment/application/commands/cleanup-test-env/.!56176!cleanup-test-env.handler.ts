import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { CleanupTestEnvCommand } from './cleanup-test-env.command';
import {
  TEST_ENV_REPOSITORY,
  ITestEnvRepository,
} from '../../../infrastructure/repositories/test-env.repository';
import { DbOperationsService } from '../../../infrastructure/db-operations.service';

@CommandHandler(CleanupTestEnvCommand)
export class CleanupTestEnvHandler implements ICommandHandler<CleanupTestEnvCommand> {
  private readonly logger = new Logger(CleanupTestEnvHandler.name);

  constructor(
    @Inject(TEST_ENV_REPOSITORY)
    private readonly repo: ITestEnvRepository,
    private readonly dbOps: DbOperationsService,
  ) {}

  async execute(cmd: CleanupTestEnvCommand): Promise<{ cleaned: boolean }> {
    const testEnv = await this.repo.findById(cmd.testEnvId);
    if (!testEnv) throw new NotFoundException(`TestEnvironment ${cmd.testEnvId} not found`);

