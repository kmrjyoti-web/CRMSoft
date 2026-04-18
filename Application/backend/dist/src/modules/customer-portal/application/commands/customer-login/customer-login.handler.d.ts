import { ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CustomerLoginCommand } from './customer-login.command';
import { ICustomerUserRepository } from '../../../domain/interfaces/customer-user.repository.interface';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class CustomerLoginHandler implements ICommandHandler<CustomerLoginCommand> {
    private readonly userRepo;
    private readonly jwtService;
    private readonly config;
    private readonly prisma;
    private readonly logger;
    constructor(userRepo: ICustomerUserRepository, jwtService: JwtService, config: ConfigService, prisma: PrismaService);
    execute(command: CustomerLoginCommand): Promise<{
        accessToken: string;
        refreshToken: string;
        isFirstLogin: boolean;
        user: {
            id: string;
            email: string;
            displayName: string;
            companyName: string | undefined;
            avatarUrl: string | undefined;
            linkedEntityType: import("../../../domain/entities/customer-user.entity").LinkedEntityType;
            linkedEntityId: string;
            linkedEntityName: string;
        };
        menu: string[];
    }>;
}
