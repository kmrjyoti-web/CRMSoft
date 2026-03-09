import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { VerificationService } from '../services/verification.service';
import { REQUIRE_VERIFICATION_KEY } from '../decorators/require-verification.decorator';

@Injectable()
export class VerificationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly verificationService: VerificationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredAction = this.reflector.getAllAndOverride<string>(
      REQUIRE_VERIFICATION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredAction) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      throw new ForbiddenException('Authentication required');
    }

    const canPerform = await this.verificationService.canPerformAction(userId, requiredAction);

    if (!canPerform) {
      const status = await this.verificationService.getVerificationStatus(userId);

      throw new ForbiddenException({
        errorCode: 'VERIFICATION_REQUIRED',
        message: this.getErrorMessage(requiredAction, status),
        verificationStatus: status.verificationStatus,
        emailVerified: status.emailVerified,
        mobileVerified: status.mobileVerified,
      });
    }

    return true;
  }

  private getErrorMessage(action: string, status: any): string {
    if (status.verificationStatus === 'UNVERIFIED') {
      return 'Please verify your email and mobile number to perform this action';
    }

    if (!status.emailVerified) {
      return 'Please verify your email to continue';
    }

    if (!status.mobileVerified) {
      return 'Please verify your mobile number to continue';
    }

    if (action === 'view_b2b_price' && !status.canSeeB2BPricing) {
      return 'Please verify your business GST to access wholesale pricing';
    }

    return 'Additional verification required';
  }
}
