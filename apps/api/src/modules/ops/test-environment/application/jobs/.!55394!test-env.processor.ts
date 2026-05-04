import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { Job } from 'bull';
import { TEST_ENV_QUEUE } from '../commands/create-test-env/create-test-env.handler';
import { DbOperationsService } from '../../infrastructure/db-operations.service';
import {
  TEST_ENV_REPOSITORY,
  ITestEnvRepository,
} from '../../infrastructure/repositories/test-env.repository';
import type { TestEnvStatus } from '@prisma/platform-client';

export interface CreateTestEnvJobData {
  testEnvId: string;
}

@Processor(TEST_ENV_QUEUE)
@Injectable()
export class TestEnvProcessor {
  private readonly logger = new Logger(TestEnvProcessor.name);

  constructor(
    private readonly dbOps: DbOperationsService,
    @Inject(TEST_ENV_REPOSITORY)
    private readonly repo: ITestEnvRepository,
  ) {}

  @Process('CREATE_TEST_ENV')
  async handleCreate(job: Job<CreateTestEnvJobData>): Promise<void> {
    const { testEnvId } = job.data;

    const testEnv = await this.repo.findById(testEnvId);
    if (!testEnv) throw new Error(`TestEnvironment not found: ${testEnvId}`);

    this.logger.log(`Processing ${testEnv.sourceType} for env: ${testEnv.name}`);

    try {
