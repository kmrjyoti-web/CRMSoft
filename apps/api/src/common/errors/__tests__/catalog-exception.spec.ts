import { HttpStatus } from '@nestjs/common';
import { CatalogException } from '../catalog-exception';

describe('CatalogException', () => {
  describe('factory methods', () => {
    it('should create badRequest with 400', () => {
      const err = CatalogException.badRequest('VALIDATION_ERROR', 'Bad data');
      expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      const response = err.getResponse() as any;
      expect(response.errorCode).toBe('VALIDATION_ERROR');
      expect(response.message).toBe('Bad data');
    });

    it('should create unauthorized with 401', () => {
      const err = CatalogException.unauthorized('AUTH_TOKEN_INVALID');
      expect(err.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should create forbidden with 403', () => {
      const err = CatalogException.forbidden('VERIFICATION_REQUIRED');
      expect(err.getStatus()).toBe(HttpStatus.FORBIDDEN);
    });

    it('should create notFound with 404', () => {
      const err = CatalogException.notFound('CONTACT_NOT_FOUND');
      expect(err.getStatus()).toBe(HttpStatus.NOT_FOUND);
      const response = err.getResponse() as any;
      expect(response.errorCode).toBe('CONTACT_NOT_FOUND');
    });

    it('should create conflict with 409 and details', () => {
      const err = CatalogException.conflict(
        'DUPLICATE_ENTRY',
        'Duplicate email',
        { field: 'email' },
      );
      expect(err.getStatus()).toBe(HttpStatus.CONFLICT);
      const response = err.getResponse() as any;
      expect(response.details).toEqual({ field: 'email' });
    });

    it('should create gone with 410', () => {
      const err = CatalogException.gone('LISTING_EXPIRED');
      expect(err.getStatus()).toBe(HttpStatus.GONE);
    });

    it('should create tooManyRequests with 429', () => {
      const err = CatalogException.tooManyRequests('OTP_MAX_ATTEMPTS');
      expect(err.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
    });

    it('should create internal with 500', () => {
      const err = CatalogException.internal('INTERNAL_ERROR');
      expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('constructor', () => {
    it('should use errorCode as default message', () => {
      const err = new CatalogException(400, 'CUSTOM_ERROR');
      const response = err.getResponse() as any;
      expect(response.message).toBe('CUSTOM_ERROR');
    });

    it('should use provided message when given', () => {
      const err = new CatalogException(400, 'CUSTOM_ERROR', 'Custom message');
      const response = err.getResponse() as any;
      expect(response.message).toBe('Custom message');
    });
  });

  describe('integration with GlobalExceptionFilter', () => {
    it('should expose errorCode in response for filter extraction', () => {
      const err = CatalogException.notFound('LISTING_NOT_FOUND', 'Listing gone');
      const response = err.getResponse() as any;
      expect(response.errorCode).toBe('LISTING_NOT_FOUND');
      expect(response.message).toBe('Listing gone');
    });
  });
});
