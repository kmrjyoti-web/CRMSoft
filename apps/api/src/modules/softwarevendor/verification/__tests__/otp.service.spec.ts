import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OtpService } from '../services/otp.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import * as crypto from 'crypto';

describe('OtpService', () => {
  let service: OtpService;

  const mockPrisma = {
    verificationOtp: {
      findFirst: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockConfig = {
    get: jest.fn().mockReturnValue('development'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get(OtpService);
    jest.clearAllMocks();
  });

  describe('sendOtp', () => {
    it('should generate and store OTP for email', async () => {
      mockPrisma.verificationOtp.findFirst.mockResolvedValue(null);
      mockPrisma.verificationOtp.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.verificationOtp.create.mockResolvedValue({ id: 'otp-1' });

      const result = await service.sendOtp({
        target: 'user@example.com',
        targetType: 'EMAIL',
        purpose: 'EMAIL_VERIFICATION',
        userId: 'user-1',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('email');
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(mockPrisma.verificationOtp.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            target: 'user@example.com',
            targetType: 'EMAIL',
            purpose: 'EMAIL_VERIFICATION',
          }),
        }),
      );
    });

    it('should generate and store OTP for mobile', async () => {
      mockPrisma.verificationOtp.findFirst.mockResolvedValue(null);
      mockPrisma.verificationOtp.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.verificationOtp.create.mockResolvedValue({ id: 'otp-2' });

      const result = await service.sendOtp({
        target: '+919876543210',
        targetType: 'MOBILE',
        purpose: 'MOBILE_VERIFICATION',
        userId: 'user-1',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('mobile');
    });

    it('should enforce cooldown between resends', async () => {
      mockPrisma.verificationOtp.findFirst.mockResolvedValue({
        createdAt: new Date(),
      });

      await expect(
        service.sendOtp({
          target: 'user@example.com',
          targetType: 'EMAIL',
          purpose: 'EMAIL_VERIFICATION',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should invalidate existing pending OTPs before creating new one', async () => {
      mockPrisma.verificationOtp.findFirst.mockResolvedValue(null);
      mockPrisma.verificationOtp.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.verificationOtp.create.mockResolvedValue({ id: 'otp-3' });

      await service.sendOtp({
        target: 'user@example.com',
        targetType: 'EMAIL',
        purpose: 'EMAIL_VERIFICATION',
      });

      expect(mockPrisma.verificationOtp.updateMany).toHaveBeenCalledWith({
        where: {
          target: 'user@example.com',
          purpose: 'EMAIL_VERIFICATION',
          status: 'OTP_PENDING',
        },
        data: { status: 'OTP_EXPIRED' },
      });
    });

    it('should store hashed OTP (not plain text)', async () => {
      mockPrisma.verificationOtp.findFirst.mockResolvedValue(null);
      mockPrisma.verificationOtp.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.verificationOtp.create.mockResolvedValue({ id: 'otp-4' });

      await service.sendOtp({
        target: 'user@example.com',
        targetType: 'EMAIL',
        purpose: 'EMAIL_VERIFICATION',
      });

      const createCall = mockPrisma.verificationOtp.create.mock.calls[0][0];
      const storedOtp = createCall.data.otp;
      // OTP should be a SHA-256 hash (64 hex chars), not a 6-digit number
      expect(storedOtp).toHaveLength(64);
      expect(storedOtp).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  describe('verifyOtp', () => {
    const makeOtpRecord = (otp: string, overrides = {}) => ({
      id: 'otp-1',
      target: 'user@example.com',
      purpose: 'EMAIL_VERIFICATION',
      status: 'OTP_PENDING',
      otp: crypto.createHash('sha256').update(otp).digest('hex'),
      attempts: 0,
      expiresAt: new Date(Date.now() + 600000),
      ...overrides,
    });

    it('should verify correct OTP', async () => {
      mockPrisma.verificationOtp.findFirst.mockResolvedValue(makeOtpRecord('123456'));
      mockPrisma.verificationOtp.update.mockResolvedValue({});

      const result = await service.verifyOtp({
        target: 'user@example.com',
        targetType: 'EMAIL',
        purpose: 'EMAIL_VERIFICATION',
        otp: '123456',
      });

      expect(result.success).toBe(true);
      expect(mockPrisma.verificationOtp.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'OTP_VERIFIED',
          }),
        }),
      );
    });

    it('should reject expired or missing OTP', async () => {
      mockPrisma.verificationOtp.findFirst.mockResolvedValue(null);

      await expect(
        service.verifyOtp({
          target: 'user@example.com',
          targetType: 'EMAIL',
          purpose: 'EMAIL_VERIFICATION',
          otp: '123456',
        }),
      ).rejects.toThrow('OTP expired or not found');
    });

    it('should reject incorrect OTP and increment attempts', async () => {
      mockPrisma.verificationOtp.findFirst.mockResolvedValue(makeOtpRecord('123456'));
      mockPrisma.verificationOtp.update.mockResolvedValue({});

      await expect(
        service.verifyOtp({
          target: 'user@example.com',
          targetType: 'EMAIL',
          purpose: 'EMAIL_VERIFICATION',
          otp: '000000',
        }),
      ).rejects.toThrow('Invalid OTP');

      expect(mockPrisma.verificationOtp.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { attempts: { increment: 1 } },
        }),
      );
    });

    it('should fail after max attempts exceeded', async () => {
      mockPrisma.verificationOtp.findFirst.mockResolvedValue(
        makeOtpRecord('123456', { attempts: 3 }),
      );
      mockPrisma.verificationOtp.update.mockResolvedValue({});

      await expect(
        service.verifyOtp({
          target: 'user@example.com',
          targetType: 'EMAIL',
          purpose: 'EMAIL_VERIFICATION',
          otp: '123456',
        }),
      ).rejects.toThrow('Too many failed attempts');

      expect(mockPrisma.verificationOtp.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'OTP_FAILED' },
        }),
      );
    });
  });
});
