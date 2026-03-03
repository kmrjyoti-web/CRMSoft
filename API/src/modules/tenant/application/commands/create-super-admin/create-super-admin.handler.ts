import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateSuperAdminCommand } from './create-super-admin.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(CreateSuperAdminCommand)
export class CreateSuperAdminHandler implements ICommandHandler<CreateSuperAdminCommand> {
  private readonly logger = new Logger(CreateSuperAdminHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateSuperAdminCommand) {
    const hashedPassword = await bcrypt.hash(command.password, 12);

    const superAdmin = await this.prisma.superAdmin.create({
      data: {
        email: command.email,
        password: hashedPassword,
        firstName: command.firstName,
        lastName: command.lastName,
      },
    });

    this.logger.log(`Super admin created: ${superAdmin.id} (${command.email})`);
    return superAdmin;
  }
}
