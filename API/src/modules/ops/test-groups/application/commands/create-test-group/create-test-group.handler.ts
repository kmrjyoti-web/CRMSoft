import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject } from '@nestjs/common';
import { CreateTestGroupCommand } from './create-test-group.command';
import { TEST_GROUP_REPOSITORY, ITestGroupRepository } from '../../../infrastructure/repositories/test-group.repository';

@CommandHandler(CreateTestGroupCommand)
export class CreateTestGroupHandler implements ICommandHandler<CreateTestGroupCommand> {
  constructor(
    @Inject(TEST_GROUP_REPOSITORY)
    private readonly repo: ITestGroupRepository,
  ) {}

  async execute(cmd: CreateTestGroupCommand): Promise<any> {
    const { tenantId, userId, dto } = cmd;

    if (!dto.steps || dto.steps.length === 0) {
      throw new BadRequestException('Test group must have at least one step');
    }

    // Validate each step has required fields
    for (const step of dto.steps) {
      if (!step.id || !step.name || !step.endpoint) {
        throw new BadRequestException(`Step is missing required fields: id, name, endpoint`);
      }
    }

    return this.repo.create({
      tenantId,
      createdById: userId,
      name: dto.name,
      nameHi: dto.nameHi,
      description: dto.description,
      icon: dto.icon,
      color: dto.color,
      modules: dto.modules,
      steps: dto.steps,
      estimatedDuration: dto.estimatedDuration,
    });
  }
}
