import { AppError } from '../app-error';
import { ERROR_CODES } from '../error-codes';

describe('AppError', () => {
  describe('from', () => {
    it('should create error from valid code', () => {
      const err = AppError.from('NOT_FOUND');
      expect(err.code).toBe('NOT_FOUND');
      expect(err.httpStatus).toBe(404);
      expect(err.message).toBe('The requested resource was not found');
    });

    it('should interpolate placeholders', () => {
      const err = AppError.from('LEAD_STATUS_INVALID_TRANSITION', {
        from: 'NEW',
        to: 'WON',
      });
      expect(err.message).toContain('NEW');
      expect(err.message).toContain('WON');
    });

    it('should fallback to INTERNAL_ERROR for unknown code', () => {
      const err = AppError.from('TOTALLY_UNKNOWN');
      expect(err.code).toBe('INTERNAL_ERROR');
      expect(err.httpStatus).toBe(500);
    });
  });

  describe('withDetails', () => {
    it('should add details to error', () => {
      const err = AppError.from('VALIDATION_ERROR').withDetails([
        { field: 'email', message: 'Required' },
      ]);
      expect(err.details).toHaveLength(1);
      expect((err.details as any)[0].field).toBe('email');
    });

    it('should preserve code and status', () => {
      const err = AppError.from('NOT_FOUND').withDetails({ id: '123' });
      expect(err.code).toBe('NOT_FOUND');
      expect(err.httpStatus).toBe(404);
    });
  });

  describe('new error codes', () => {
    it('should have verification error codes', () => {
      expect(ERROR_CODES.VERIFICATION_REQUIRED).toBeDefined();
      expect(ERROR_CODES.OTP_EXPIRED).toBeDefined();
      expect(ERROR_CODES.OTP_INVALID).toBeDefined();
      expect(ERROR_CODES.OTP_MAX_ATTEMPTS).toBeDefined();
      expect(ERROR_CODES.GST_INVALID_FORMAT).toBeDefined();
      expect(ERROR_CODES.GST_ALREADY_REGISTERED).toBeDefined();
      expect(ERROR_CODES.EMAIL_ALREADY_VERIFIED).toBeDefined();
      expect(ERROR_CODES.MOBILE_ALREADY_VERIFIED).toBeDefined();
    });

    it('should have marketplace error codes', () => {
      expect(ERROR_CODES.LISTING_NOT_FOUND).toBeDefined();
      expect(ERROR_CODES.LISTING_EXPIRED).toBeDefined();
      expect(ERROR_CODES.LISTING_INACTIVE).toBeDefined();
      expect(ERROR_CODES.B2B_VERIFICATION_REQUIRED).toBeDefined();
      expect(ERROR_CODES.ENQUIRY_NOT_FOUND).toBeDefined();
      expect(ERROR_CODES.ORDER_NOT_FOUND).toBeDefined();
      expect(ERROR_CODES.ORDER_EMPTY_ITEMS).toBeDefined();
      expect(ERROR_CODES.POST_NOT_FOUND).toBeDefined();
    });

    it('should have plugin error codes', () => {
      expect(ERROR_CODES.PLUGIN_NOT_CONFIGURED).toBeDefined();
      expect(ERROR_CODES.PLUGIN_CREDENTIALS_INVALID).toBeDefined();
      expect(ERROR_CODES.PLUGIN_API_FAILED).toBeDefined();
    });

    it('should have ticket/settings error codes', () => {
      expect(ERROR_CODES.TICKET_NOT_FOUND).toBeDefined();
      expect(ERROR_CODES.TICKET_CLOSED).toBeDefined();
      expect(ERROR_CODES.TOUR_PLAN_CONFLICT).toBeDefined();
      expect(ERROR_CODES.ROLE_IN_USE).toBeDefined();
      expect(ERROR_CODES.LOOKUP_NOT_FOUND).toBeDefined();
    });

    it('should create AppError from new codes', () => {
      const err = AppError.from('LISTING_NOT_FOUND');
      expect(err.httpStatus).toBe(404);
      expect(err.message).toBe('Listing not found');
    });

    it('should have correct HTTP statuses for new codes', () => {
      expect(ERROR_CODES.OTP_MAX_ATTEMPTS.httpStatus).toBe(429);
      expect(ERROR_CODES.LISTING_EXPIRED.httpStatus).toBe(410);
      expect(ERROR_CODES.PLUGIN_API_FAILED.httpStatus).toBe(502);
      expect(ERROR_CODES.B2B_VERIFICATION_REQUIRED.httpStatus).toBe(403);
    });
  });
});
