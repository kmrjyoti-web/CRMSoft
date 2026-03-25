import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdatePortalUserCommand } from './update-portal-user.command';
import { ICustomerUserRepository, CUSTOMER_USER_REPOSITORY } from '../../../domain/interfaces/customer-user.repository.interface';

@CommandHandler(UpdatePortalUserCommand)
export class UpdatePortalUserHandler implements ICommandHandler<UpdatePortalUserCommand> {
  constructor(
    @Inject(CUSTOMER_USER_REPOSITORY)
    private readonly userRepo: ICustomerUserRepository,
  ) {}

  async execute(command: UpdatePortalUserCommand) {
    const { customerUserId, menuCategoryId, pageOverrides, isActive } = command;

    const user = await this.userRepo.findById(customerUserId);
    if (!user) throw new NotFoundException('Portal user not found');

    if (menuCategoryId !== undefined) user.updateMenuCategory(menuCategoryId);
    if (pageOverrides !== undefined) user.updatePageOverrides(pageOverrides);
    if (isActive !== undefined) {
      isActive ? user.activate() : user.deactivate();
    }

    await this.userRepo.update(user);
    return { id: user.id, message: 'Portal user updated' };
  }
}
