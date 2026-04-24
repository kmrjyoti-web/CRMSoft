import { RawContactStatus } from '../../domain/value-objects/raw-contact-status.vo';

describe('RawContactStatus Value Object', () => {
  describe('fromString()', () => {
    it.each(['RAW', 'VERIFIED', 'REJECTED', 'DUPLICATE'])(
      'should create %s', (s) => expect(RawContactStatus.fromString(s).value).toBe(s),
    );
    it('should throw on INVALID', () => expect(() => RawContactStatus.fromString('INVALID')).toThrow());
    it('should throw on empty', () => expect(() => RawContactStatus.fromString('')).toThrow());
  });

  describe('canTransitionTo()', () => {
    it('RAW → VERIFIED ✓', () => expect(RawContactStatus.RAW.canTransitionTo(RawContactStatus.VERIFIED)).toBe(true));
    it('RAW → REJECTED ✓', () => expect(RawContactStatus.RAW.canTransitionTo(RawContactStatus.REJECTED)).toBe(true));
    it('RAW → DUPLICATE ✓', () => expect(RawContactStatus.RAW.canTransitionTo(RawContactStatus.DUPLICATE)).toBe(true));
    it('VERIFIED → anywhere ✗', () => expect(RawContactStatus.VERIFIED.canTransitionTo(RawContactStatus.RAW)).toBe(false));
    it('VERIFIED → REJECTED ✗', () => expect(RawContactStatus.VERIFIED.canTransitionTo(RawContactStatus.REJECTED)).toBe(false));
    it('REJECTED → RAW ✓', () => expect(RawContactStatus.REJECTED.canTransitionTo(RawContactStatus.RAW)).toBe(true));
    it('REJECTED → VERIFIED ✗', () => expect(RawContactStatus.REJECTED.canTransitionTo(RawContactStatus.VERIFIED)).toBe(false));
    it('DUPLICATE → anywhere ✗', () => expect(RawContactStatus.DUPLICATE.canTransitionTo(RawContactStatus.RAW)).toBe(false));
  });

  describe('isTerminal()', () => {
    it('VERIFIED is terminal', () => expect(RawContactStatus.VERIFIED.isTerminal()).toBe(true));
    it('DUPLICATE is terminal', () => expect(RawContactStatus.DUPLICATE.isTerminal()).toBe(true));
    it('RAW is not terminal', () => expect(RawContactStatus.RAW.isTerminal()).toBe(false));
    it('REJECTED is not terminal', () => expect(RawContactStatus.REJECTED.isTerminal()).toBe(false));
  });

  describe('equals()', () => {
    it('same → true', () => expect(RawContactStatus.RAW.equals(RawContactStatus.RAW)).toBe(true));
    it('different → false', () => expect(RawContactStatus.RAW.equals(RawContactStatus.VERIFIED)).toBe(false));
  });
});
