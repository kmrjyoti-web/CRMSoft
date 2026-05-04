import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { VerificationGuard } from '../guards/verification.guard';
import { VerificationService } from '../services/verification.service';

describe('VerificationGuard', () => {
  let guard: VerificationGuard;

  const mockVerificationService = {
    canPerformAction: jest.fn(),
    getVerificationStatus: jest.fn(),
  };

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const createMockContext = (userId?: string): ExecutionContext =>
    ({
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          user: userId ? { id: userId } : undefined,
        }),
      }),
    }) as any;

  beforeEach(() => {
    guard = new VerificationGuard(
      mockReflector as unknown as Reflector,
      mockVerificationService as unknown as VerificationService,
    );
    jest.clearAllMocks();
  });

  it('should allow when no verification required', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(undefined);

    const result = await guard.canActivate(createMockContext('user-1'));
    expect(result).toBe(true);
  });

  it('should throw ForbiddenException when user not authenticated', async () => {
    mockReflector.getAllAndOverride.mockReturnValue('enquiry');

    await expect(guard.canActivate(createMockContext())).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should allow when user can perform action', async () => {
    mockReflector.getAllAndOverride.mockReturnValue('browse');
    mockVerificationService.canPerformAction.mockResolvedValue(true);

    const result = await guard.canActivate(createMockContext('user-1'));
    expect(result).toBe(true);
  });

  it('should throw when user cannot perform action', async () => {
    mockReflector.getAllAndOverride.mockReturnValue('enquiry');
    mockVerificationService.canPerformAction.mockResolvedValue(false);
    mockVerificationService.getVerificationStatus.mockResolvedValue({
      verificationStatus: 'UNVERIFIED',
      emailVerified: false,
      mobileVerified: false,
    });

    await expect(
      guard.canActivate(createMockContext('user-1')),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should include verification status in error response', async () => {
    mockReflector.getAllAndOverride.mockReturnValue('enquiry');
    mockVerificationService.canPerformAction.mockResolvedValue(false);
    mockVerificationService.getVerificationStatus.mockResolvedValue({
      verificationStatus: 'PARTIALLY_VERIFIED',
      emailVerified: true,
      mobileVerified: false,
    });

    try {
      await guard.canActivate(createMockContext('user-1'));
      fail('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenException);
      const response = (error as ForbiddenException).getResponse();
      expect(response).toMatchObject({
        errorCode: 'VERIFICATION_REQUIRED',
      });
    }
  });
});
