import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { UpdateProfileCommand } from './update-profile.command';

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileHandler implements ICommandHandler<UpdateProfileCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: UpdateProfileCommand) {
    const updateData: any = {};
    const d = cmd.data;
    if (d.name !== undefined) updateData.name = d.name;
    if (d.description !== undefined) updateData.description = d.description;
    if (d.sourceSystem !== undefined) updateData.sourceSystem = d.sourceSystem;
    if (d.icon !== undefined) updateData.icon = d.icon;
    if (d.color !== undefined) updateData.color = d.color;
    if (d.fieldMapping !== undefined) updateData.fieldMapping = d.fieldMapping;
    if (d.expectedHeaders !== undefined) updateData.expectedHeaders = d.expectedHeaders;
    if (d.defaultValues !== undefined) updateData.defaultValues = d.defaultValues;
    if (d.validationRules !== undefined) updateData.validationRules = d.validationRules;
    if (d.duplicateCheckFields !== undefined) updateData.duplicateCheckFields = d.duplicateCheckFields;
    if (d.duplicateStrategy !== undefined) updateData.duplicateStrategy = d.duplicateStrategy;
    if (d.fuzzyMatchEnabled !== undefined) updateData.fuzzyMatchEnabled = d.fuzzyMatchEnabled;
    if (d.fuzzyMatchFields !== undefined) updateData.fuzzyMatchFields = d.fuzzyMatchFields;
    if (d.fuzzyThreshold !== undefined) updateData.fuzzyThreshold = d.fuzzyThreshold;

    return this.prisma.working.importProfile.update({ where: { id: cmd.profileId }, data: updateData });
  }
}
