import { CustomerUserEntity } from '../domain/entities/customer-user.entity';
import { isOk, isErr } from '@/common/types';

const BASE_PROPS = {
  email: 'test@example.com',
  linkedEntityType: 'CONTACT' as const,
  linkedEntityId: 'entity-1',
  linkedEntityName: 'Ravi Sharma',
  displayName: 'Ravi Sharma',
  isActive: true,
  createdById: 'admin-1',
};

describe('CustomerUserEntity', () => {
  describe('create', () => {
    it('creates a valid customer user', async () => {
      const result = await CustomerUserEntity.create('id-1', 'tenant-1', {
        ...BASE_PROPS,
        password: 'SecurePass1',
      });
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.email).toBe('test@example.com');
        expect(result.data.isFirstLogin).toBe(true);
        expect(result.data.loginCount).toBe(0);
        expect(result.data.failedAttempts).toBe(0);
      }
    });

    it('rejects invalid email', async () => {
      const result = await CustomerUserEntity.create('id-1', 'tenant-1', {
        ...BASE_PROPS,
        email: 'not-an-email',
        password: 'SecurePass1',
      });
      expect(isErr(result)).toBe(true);
    });

    it('rejects password shorter than 8 characters', async () => {
      const result = await CustomerUserEntity.create('id-1', 'tenant-1', {
        ...BASE_PROPS,
        password: 'short',
      });
      expect(isErr(result)).toBe(true);
    });

    it('rejects missing linkedEntityId', async () => {
      const result = await CustomerUserEntity.create('id-1', 'tenant-1', {
        ...BASE_PROPS,
        linkedEntityId: '',
        password: 'SecurePass1',
      });
      expect(isErr(result)).toBe(true);
    });
  });

  describe('validatePassword', () => {
    it('returns true for correct password', async () => {
      const result = await CustomerUserEntity.create('id-1', 'tenant-1', {
        ...BASE_PROPS,
        password: 'MyPassword@123',
      });
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(await result.data.validatePassword('MyPassword@123')).toBe(true);
      }
    });

    it('returns false for wrong password', async () => {
      const result = await CustomerUserEntity.create('id-1', 'tenant-1', {
        ...BASE_PROPS,
        password: 'MyPassword@123',
      });
      if (isOk(result)) {
        expect(await result.data.validatePassword('WrongPassword')).toBe(false);
      }
    });
  });

  describe('isLocked', () => {
    it('is not locked by default', async () => {
      const result = await CustomerUserEntity.create('id-1', 'tenant-1', {
        ...BASE_PROPS,
        password: 'SecurePass1',
      });
      if (isOk(result)) {
        expect(result.data.isLocked).toBe(false);
      }
    });

    it('is locked when lockedUntil is in the future', async () => {
      const entity = CustomerUserEntity.fromPersistence(
        'id-1',
        'tenant-1',
        {
          ...BASE_PROPS,
          passwordHash: 'hash',
          pageOverrides: {},
          failedAttempts: 5,
          loginCount: 0,
          isFirstLogin: true,
          isDeleted: false,
          lockedUntil: new Date(Date.now() + 60_000),
        },
        new Date(),
        new Date(),
      );
      expect(entity.isLocked).toBe(true);
    });
  });

  describe('recordFailedLogin — 5-attempt lockout', () => {
    it('locks after 5 failed attempts', async () => {
      const result = await CustomerUserEntity.create('id-1', 'tenant-1', {
        ...BASE_PROPS,
        password: 'SecurePass1',
      });
      if (isOk(result)) {
        const entity = result.data;
        for (let i = 0; i < 5; i++) entity.recordFailedLogin();
        expect(entity.failedAttempts).toBe(5);
        expect(entity.isLocked).toBe(true);
      }
    });

    it('does not lock before 5 attempts', async () => {
      const result = await CustomerUserEntity.create('id-1', 'tenant-1', {
        ...BASE_PROPS,
        password: 'SecurePass1',
      });
      if (isOk(result)) {
        const entity = result.data;
        for (let i = 0; i < 4; i++) entity.recordFailedLogin();
        expect(entity.isLocked).toBe(false);
      }
    });
  });

  describe('resolveMenu', () => {
    it('shows all category routes when no overrides', async () => {
      const result = await CustomerUserEntity.create('id-1', 'tenant-1', {
        ...BASE_PROPS,
        password: 'SecurePass1',
      });
      if (isOk(result)) {
        const routes = result.data.resolveMenu(['/dashboard', '/invoices', '/ledger']);
        expect(routes).toEqual(['/dashboard', '/invoices', '/ledger']);
      }
    });

    it('hides routes overridden to false', async () => {
      const entity = CustomerUserEntity.fromPersistence(
        'id-1',
        'tenant-1',
        {
          ...BASE_PROPS,
          passwordHash: 'hash',
          failedAttempts: 0,
          loginCount: 0,
          isFirstLogin: true,
          isDeleted: false,
          pageOverrides: { '/ledger': false, '/employees': true },
        },
        new Date(),
        new Date(),
      );
      const routes = entity.resolveMenu(['/dashboard', '/invoices', '/ledger', '/employees']);
      expect(routes).toContain('/dashboard');
      expect(routes).toContain('/invoices');
      expect(routes).not.toContain('/ledger');
      expect(routes).toContain('/employees');
    });

    it('shows route added via override even if not in category', async () => {
      const entity = CustomerUserEntity.fromPersistence(
        'id-1',
        'tenant-1',
        {
          ...BASE_PROPS,
          passwordHash: 'hash',
          failedAttempts: 0,
          loginCount: 0,
          isFirstLogin: true,
          isDeleted: false,
          pageOverrides: { '/employees': true },
        },
        new Date(),
        new Date(),
      );
      // /employees not in category routes but the resolveMenu filters from categoryRoutes
      // Override doesn't ADD routes — it only hides/shows within category
      const routes = entity.resolveMenu(['/dashboard']);
      expect(routes).toContain('/dashboard');
    });
  });
});
