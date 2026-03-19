import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { CreateLookupCommand } from './create-lookup.command';

@CommandHandler(CreateLookupCommand)
export class CreateLookupHandler implements ICommandHandler<CreateLookupCommand> {
  private readonly logger = new Logger(CreateLookupHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateLookupCommand): Promise<string> {
    const category = command.category.toUpperCase().replace(/\s+/g, '_');

    const existing = await this.prisma.platform.masterLookup.findFirst({
      where: { category },
    });
    if (existing) throw new ConflictException(`Lookup category "${category}" already exists`);

    const lookup = await this.prisma.platform.masterLookup.create({
      data: {
        category,
        displayName: command.displayName.trim(),
        description: command.description?.trim() || null,
        isSystem: command.isSystem ?? false,
      },
    });

    this.logger.log(`Lookup created: ${category}`);
    return lookup.id;
  }
}
