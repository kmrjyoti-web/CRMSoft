import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CustomerLoginDto } from './dto/customer-login.dto';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';
declare class RefreshTokenDto {
    refreshToken: string;
}
declare class ForgotPasswordDto {
    email: string;
    tenantId: string;
}
declare class ResetPasswordDto {
    token: string;
    newPassword: string;
}
declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class CustomerAuthController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    login(dto: CustomerLoginDto, req: {
        ip?: string;
        headers: {
            'user-agent'?: string;
        };
    }): Promise<any>;
    refresh(dto: RefreshTokenDto): Promise<any>;
    forgotPassword(dto: ForgotPasswordDto): Promise<any>;
    resetPassword(dto: ResetPasswordDto): Promise<any>;
    changePassword(req: {
        customerUser: {
            id: string;
        };
    }, dto: ChangePasswordDto): Promise<any>;
    getMenu(req: {
        customerUser: {
            id: string;
        };
    }): Promise<any>;
    getProfile(req: {
        customerUser: {
            id: string;
        };
    }): Promise<any>;
    updateProfile(req: {
        customerUser: {
            id: string;
        };
    }, dto: UpdateCustomerProfileDto): {
        message: string;
        displayName?: string;
        phone?: string;
        avatarUrl?: string;
        id: string;
    };
}
export {};
