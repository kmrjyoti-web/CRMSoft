import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { VerificationService } from '../services/verification.service';
import { OtpService } from '../services/otp.service';
import { PrismaService } from '../../../core/prisma/prisma.service';

describe('VerificationService', () => {
  let service: VerificationService;

  const MOCK_USER = {
    id: 'user-1',
    tenantId: 'tenant-1',
    email: 'test@example.com',
    phone: '+919876543210',
    emailVerified: false,
    mobileVerified: false,
    verificationStatus: 'UNVERIFIED' as const,
    registrationType: 'INDIVIDUAL' as const,
    gstNumber: null,
    gstVerified: false,
    companyName: null,
    businessType: null,
  };

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    gstVerificationLog: {
      create: jest.fn(),
    },
  };

  const mockOtpService = {
    sendOtp: jest.fn().mockResolvedValue({
      success: true,
      message: 'OTP sent',
      expiresAt: new Date(),
    }),
    verifyOtp: jest.fn().mockResolvedValue({
      success: true,
      message: 'Verified',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificationService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: OtpService, useValue: mockOtpService },
      ],
    }).compile();

    service = module.get(VerificationService);
    jest.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════
  // EMAIL VERIFICATION
  // ═══════════════════════════════════════════════════════

  describe('sendEmailVerification', () => {
    it('should send email OTP', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(MOCK_USER);

      const result = await service.sendEmailVerification('user-1');

      expect(result.success).toBe(true);
      expect(mockOtpService.sendOtp).toHaveBeenCalledWith(
        expect.objectContaining({
          target: 'test@example.com',
          targetType: 'EMAIL',
          purpose: 'EMAIL_VERIFICATION',
        }),
      );
    });

    it('should throw if email already verified', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...MOCK_USER,
        emailVerified: true,
      });

      await expect(service.sendEmailVerification('user-1')).rejects.toThrow(
        'Email is already verified',
      );
    });
  });

  describe('verifyEmail', () => {
    it('should verify email and update status', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(MOCK_USER);
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.verifyEmail('user-1', '123456');

      expect(result.success).toBe(true);
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            emailVerified: true,
            verificationStatus: 'PARTIALLY_VERIFIED',
          }),
        }),
      );
    });

    it('should set FULLY_VERIFIED when both email and mobile verified', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...MOCK_USER,
        mobileVerified: true,
      });
      mockPrisma.user.update.mockResolvedValue({});

      await service.verifyEmail('user-1', '123456');

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            verificationStatus: 'FULLY_VERIFIED',
          }),
        }),
      );
    });
  });

  // ═══════════════════════════════════════════════════════
  // MOBILE VERIFICATION
  // ═══════════════════════════════════════════════════════

  describe('sendMobileVerification', () => {
    it('should send mobile OTP', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(MOCK_USER);

      const result = await service.sendMobileVerification('user-1');

      expect(result.success).toBe(true);
      expect(mockOtpService.sendOtp).toHaveBeenCalledWith(
        expect.objectContaining({
          target: '+919876543210',
          targetType: 'MOBILE',
          purpose: 'MOBILE_VERIFICATION',
        }),
      );
    });

    it('should throw if no phone number', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...MOCK_USER,
        phone: null,
      });

      await expect(service.sendMobileVerification('user-1')).rejects.toThrow(
        'Mobile number not provided',
      );
    });

    it('should throw if mobile already verified', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...MOCK_USER,
        mobileVerified: true,
      });

      await expect(service.sendMobileVerification('user-1')).rejects.toThrow(
        'Mobile is already verified',
      );
    });
  });

  describe('verifyMobile', () => {
    it('should verify mobile and update status', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(MOCK_USER);
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.verifyMobile('user-1', '123456');

      expect(result.success).toBe(true);
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            mobileVerified: true,
            verificationStatus: 'PARTIALLY_VERIFIED',
          }),
        }),
      );
    });

    it('should throw if no phone number', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...MOCK_USER,
        phone: null,
      });

      await expect(service.verifyMobile('user-1', '123456')).rejects.toThrow(
        'Mobile number not provided',
      );
    });
  });

  // ═══════════════════════════════════════════════════════
  // GST VERIFICATION
  // ═══════════════════════════════════════════════════════

  describe('submitGstForVerification', () => {
    const validGst = '29ABCDE1234F1Z5';

    it('should validate GST format and submit', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(MOCK_USER);
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.update.mockResolvedValue({});
      mockPrisma.gstVerificationLog.create.mockResolvedValue({});

      const result = await service.submitGstForVerification(
        'user-1',
        validGst,
        'Test Corp',
      );

      expect(result.success).toBe(true);
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            gstNumber: validGst,
            registrationType: 'BUSINESS',
          }),
        }),
      );
    });

    it('should reject invalid GST format', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(MOCK_USER);

      await expect(
        service.submitGstForVerification('user-1', 'INVALID', 'Test Corp'),
      ).rejects.toThrow('Invalid GST number format');
    });

    it('should reject duplicate GST', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(MOCK_USER);
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'user-2' });

      await expect(
        service.submitGstForVerification('user-1', validGst, 'Test Corp'),
      ).rejects.toThrow('already registered');
    });
  });

  describe('approveGstManually', () => {
    it('should approve GST and create log', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...MOCK_USER,
        gstNumber: '29ABCDE1234F1Z5',
        companyName: 'Test Corp',
      });
      mockPrisma.user.update.mockResolvedValue({});
      mockPrisma.gstVerificationLog.create.mockResolvedValue({});

      const result = await service.approveGstManually('user-1', 'admin-1', 'Looks good');

      expect(result.success).toBe(true);
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            gstVerified: true,
            gstVerificationMethod: 'MANUAL',
          }),
        }),
      );
      expect(mockPrisma.gstVerificationLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            approvedBy: 'admin-1',
            verificationMethod: 'MANUAL',
          }),
        }),
      );
    });

    it('should throw if no GST submitted', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(MOCK_USER);

      await expect(
        service.approveGstManually('user-1', 'admin-1'),
      ).rejects.toThrow('User has not submitted GST number');
    });
  });

  // ═══════════════════════════════════════════════════════
  // VERIFICATION STATUS & PERMISSIONS
  // ═══════════════════════════════════════════════════════

  describe('getVerificationStatus', () => {
    it('should return status for unverified user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(MOCK_USER);

      const status = await service.getVerificationStatus('user-1');

      expect(status.verificationStatus).toBe('UNVERIFIED');
      expect(status.emailVerified).toBe(false);
      expect(status.mobileVerified).toBe(false);
      expect(status.canSeeB2BPricing).toBe(false);
      expect(status.allowedActions).toContain('browse');
      expect(status.allowedActions).not.toContain('like');
    });

    it('should return B2B pricing access for verified business', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...MOCK_USER,
        emailVerified: true,
        mobileVerified: true,
        verificationStatus: 'FULLY_VERIFIED',
        registrationType: 'BUSINESS',
        gstVerified: true,
      });

      const status = await service.getVerificationStatus('user-1');

      expect(status.canSeeB2BPricing).toBe(true);
      expect(status.allowedActions).toContain('view_b2b_price');
      expect(status.allowedActions).toContain('enquiry');
      expect(status.allowedActions).toContain('order');
    });

    it('should throw for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getVerificationStatus('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('canPerformAction', () => {
    it('should allow browse for unverified user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(MOCK_USER);

      expect(await service.canPerformAction('user-1', 'browse')).toBe(true);
    });

    it('should deny like for unverified user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(MOCK_USER);

      expect(await service.canPerformAction('user-1', 'like')).toBe(false);
    });

    it('should allow like for partially verified user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...MOCK_USER,
        emailVerified: true,
        verificationStatus: 'PARTIALLY_VERIFIED',
      });

      expect(await service.canPerformAction('user-1', 'like')).toBe(true);
    });

    it('should deny enquiry for partially verified user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...MOCK_USER,
        emailVerified: true,
        verificationStatus: 'PARTIALLY_VERIFIED',
      });

      expect(await service.canPerformAction('user-1', 'enquiry')).toBe(false);
    });

    it('should allow enquiry for fully verified user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...MOCK_USER,
        emailVerified: true,
        mobileVerified: true,
        verificationStatus: 'FULLY_VERIFIED',
      });

      expect(await service.canPerformAction('user-1', 'enquiry')).toBe(true);
    });
  });

  describe('requireVerification', () => {
    it('should not throw for allowed action', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(MOCK_USER);

      await expect(
        service.requireVerification('user-1', 'browse'),
      ).resolves.not.toThrow();
    });

    it('should throw for disallowed action', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(MOCK_USER);

      await expect(
        service.requireVerification('user-1', 'enquiry'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
