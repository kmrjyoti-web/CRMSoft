import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { AddValueCommand } from './add-value.command';

@CommandHandler(AddValueCommand)
export class AddValueHandler implements ICommandHandler<AddValueCommand> {
  private readonly logger = new Logger(AddValueHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: AddValueCommand): Promise<string> {
    const lookup = await this.prisma.masterLookup.findUnique({
      where: { id: command.lookupId },
    });
    if (!lookup) throw new NotFoundException(`Lookup ${command.lookupId} not found`);

    // Check duplicate value within same lookup
    const existing = await this.prisma.lookupValue.findFirst({
      where: { lookupId: command.lookupId, value: command.value },
    });
    if (existing) throw new ConflictException(`Value "${command.value}" already exists in ${lookup.category}`);

    // Get next rowIndex
    const maxRow = await this.prisma.lookupValue.aggregate({
      where: { lookupId: command.lookupId },
      _max: { rowIndex: true },
    });
    const nextIndex = (maxRow._max.rowIndex ?? -1) + 1;

    // If setting as default, unset existing default
    if (command.isDefault) {
      await this.prisma.lookupValue.updateMany({
        where: { lookupId: command.lookupId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const val = await this.prisma.lookupValue.create({
      data: {
        lookupId: command.lookupId,
        value: command.value.trim(),
        label: command.label.trim(),
        icon: command.icon || null,
        color: command.color || null,
        rowIndex: nextIndex,
        isDefault: command.isDefault ?? false,
        parentId: command.parentId || null,
        configJson: command.configJson || null,
      },
    });

    this.logger.log(`Value "${command.value}" added to ${lookup.category}`);
    return val.id;
  }
}
