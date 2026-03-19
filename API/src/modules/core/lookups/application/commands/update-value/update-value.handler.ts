import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { UpdateValueCommand } from './update-value.command';

@CommandHandler(UpdateValueCommand)
export class UpdateValueHandler implements ICommandHandler<UpdateValueCommand> {
  private readonly logger = new Logger(UpdateValueHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateValueCommand): Promise<void> {
    const val = await this.prisma.lookupValue.findUnique({
      where: { id: command.valueId },
    });
    if (!val) throw new NotFoundException(`LookupValue ${command.valueId} not found`);

    // If setting as default, unset existing default
    if (command.data.isDefault) {
      await this.prisma.lookupValue.updateMany({
        where: { lookupId: val.lookupId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const updateData: any = {};
    if (command.data.label) updateData.label = command.data.label.trim();
    if (command.data.icon !== undefined) updateData.icon = command.data.icon || null;
    if (command.data.color !== undefined) updateData.color = command.data.color || null;
    if (command.data.isDefault !== undefined) updateData.isDefault = command.data.isDefault;
    if (command.data.configJson !== undefined) updateData.configJson = command.data.configJson;

    await this.prisma.lookupValue.update({ where: { id: command.valueId }, data: updateData });
    this.logger.log(`LookupValue ${val.value} updated`);
  }
}
