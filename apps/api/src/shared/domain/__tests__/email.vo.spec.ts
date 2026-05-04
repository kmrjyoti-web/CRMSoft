import { Email } from '../value-objects/email.vo';

describe('Email Value Object', () => {
  describe('create()', () => {
    it('should create a valid email', () => {
      const email = Email.create('test@example.com');
      expect(email.value).toBe('test@example.com');
    });

    it('should lowercase the email', () => {
      const email = Email.create('Test@EXAMPLE.com');
      expect(email.value).toBe('test@example.com');
    });

    it('should trim whitespace', () => {
      const email = Email.create('  test@example.com  ');
      expect(email.value).toBe('test@example.com');
    });

    it('should throw on empty string', () => {
      expect(() => Email.create('')).toThrow('Email cannot be empty');
    });

    it('should throw on invalid format', () => {
      expect(() => Email.create('not-an-email')).toThrow('Invalid email format');
    });

    it('should throw on missing @', () => {
      expect(() => Email.create('testexample.com')).toThrow('Invalid email format');
    });

    it('should throw on missing domain', () => {
      expect(() => Email.create('test@')).toThrow('Invalid email format');
    });
  });

  describe('createOptional()', () => {
    it('should return undefined for empty string', () => {
      expect(Email.createOptional('')).toBeUndefined();
    });

    it('should return undefined for undefined', () => {
      expect(Email.createOptional(undefined)).toBeUndefined();
    });

    it('should return Email for valid input', () => {
      const email = Email.createOptional('test@example.com');
      expect(email?.value).toBe('test@example.com');
    });
  });

  describe('equals()', () => {
    it('should return true for same email', () => {
      const a = Email.create('test@example.com');
      const b = Email.create('test@example.com');
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for different email', () => {
      const a = Email.create('a@example.com');
      const b = Email.create('b@example.com');
      expect(a.equals(b)).toBe(false);
    });

    it('should be case-insensitive', () => {
      const a = Email.create('Test@Example.com');
      const b = Email.create('test@example.com');
      expect(a.equals(b)).toBe(true);
    });
  });
});

