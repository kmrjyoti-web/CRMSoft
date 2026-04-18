import { ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshCustomerTokenCommand } from './refresh-customer-token.command';
import { ICustomerUserRepository } from '../../../domain/interfaces/customer-user.repository.interface';
export declare class RefreshCustomerTokenHandler implements ICommandHandler<RefreshCustomerTokenCommand> {
    private readonly userRepo;
    private readonly jwtService;
    private readonly config;
    private readonly logger;
    constructor(userRepo: ICustomerUserRepository, jwtService: JwtService, config: ConfigService);
    execute(command: RefreshCustomerTokenCommand): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
}
