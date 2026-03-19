import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { CreateWorkflowCommand } from './create-workflow.command';

@CommandHandler(CreateWorkflowCommand)
export class CreateWorkflowHandler implements ICommandHandler<CreateWorkflowCommand> {
  private readonly logger = new Logger(CreateWorkflowHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CreateWorkflowCommand) {
    const existing = await this.prisma.workflow.findFirst({ where: { code: cmd.code } });
    if (existing) throw new ConflictException(`Workflow code "${cmd.code}" already exists`);

    const workflow = await this.prisma.workflow.create({
      data: {
        name: cmd.name,
        code: cmd.code,
        entityType: cmd.entityType,
        description: cmd.description,
        isDefault: cmd.isDefault ?? false,
        configJson: cmd.configJson,
        createdById: cmd.createdById,
      },
    });

    this.logger.log(`Workflow created: ${workflow.id} (${workflow.code})`);
    return workflow;
  }
}
