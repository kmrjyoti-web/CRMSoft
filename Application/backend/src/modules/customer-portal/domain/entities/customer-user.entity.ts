import { BaseEntity } from '../../../../common/ddd';
import { Ok, Err, ResultType } from '@/common/types';
import * as bcrypt from 'bcrypt';

export type LinkedEntityType = 'CONTACT' | 'ORGANIZATION' | 'LEDGER';

export interface CustomerUserProps {
  email: string;
  phone?: string;
  passwordHash: string;
  linkedEntityType: LinkedEntityType;
  linkedEntityId: string;
  linkedEntityName: string;
  displayName: string;
  avatarUrl?: string;
  companyName?: string;
  gstin?: string;
  menuCategoryId?: string;
  pageOverrides: Record<string, boolean>;
  isActive: boolean;
  isFirstLogin: boolean;
  lastLoginAt?: Date;
  loginCount: number;
  failedAttempts: number;
  lockedUntil?: Date;
  refreshToken?: string;
  refreshTokenExp?: Date;
  passwordResetToken?: string;
  passwordResetExp?: Date;
  isDeleted: boolean;
  createdById: string;
}

export class CustomerUserEntity extends BaseEntity<CustomerUserProps> {
  private constructor(id: string, tenantId: string, props: CustomerUserProps) {
    super(id, tenantId, props);
  }

  static async create(
    id: string,
    tenantId: string,
    props: Omit<CustomerUserProps, 'passwordHash' | 'failedAttempts' | 'isFirstLogin' | 'loginCount' | 'isDeleted' | 'pageOverrides'> & {
      password: string;
    },
  ): Promise<ResultType<CustomerUserEntity>> {
    if (!props.email || !props.email.includes('@')) {
      return Err('CP_001', 'Valid email is required');
    }
    if (!props.password || props.password.length < 8) {
      return Err('CP_002', 'Password must be at least 8 characters');
    }
    if (!props.linkedEntityId) {
      return Err('CP_003', 'Linked entity is required');
    }

    const passwordHash = await bcrypt.hash(props.password, 12);

    return Ok(
      new CustomerUserEntity(id, tenantId, {
        ...props,
        passwordHash,
        pageOverrides: {},
        failedAttempts: 0,
        loginCount: 0,
        isFirstLogin: true,
        isDeleted: false,
      }),
    );
  }

  /** Reconstruct from persisted record (infrastructure mapper). */
  static fromPersistence(
    id: string,
    tenantId: string,
    props: CustomerUserProps,
    createdAt: Date,
    updatedAt: Date,
  ): CustomerUserEntity {
    const entity = new CustomerUserEntity(id, tenantId, props);
    entity.setTimestamps(createdAt, updatedAt);
    return entity;
  }

  // ─── Getters ────────────────────────────────────────────

  get email(): string { return this.props.email; }
  get phone(): string | undefined { return this.props.phone; }
  get passwordHash(): string { return this.props.passwordHash; }
  get linkedEntityType(): LinkedEntityType { return this.props.linkedEntityType; }
  get linkedEntityId(): string { return this.props.linkedEntityId; }
  get linkedEntityName(): string { return this.props.linkedEntityName; }
  get displayName(): string { return this.props.displayName; }
  get avatarUrl(): string | undefined { return this.props.avatarUrl; }
  get companyName(): string | undefined { return this.props.companyName; }
  get gstin(): string | undefined { return this.props.gstin; }
  get menuCategoryId(): string | undefined { return this.props.menuCategoryId; }
  get pageOverrides(): Record<string, boolean> { return this.props.pageOverrides; }
  get lastLoginAt(): Date | undefined { return this.props.lastLoginAt; }
  get isActive(): boolean { return this.props.isActive; }
  get isFirstLogin(): boolean { return this.props.isFirstLogin; }
  get loginCount(): number { return this.props.loginCount; }
  get failedAttempts(): number { return this.props.failedAttempts; }
  get lockedUntil(): Date | undefined { return this.props.lockedUntil; }
  get refreshToken(): string | undefined { return this.props.refreshToken; }
  get refreshTokenExp(): Date | undefined { return this.props.refreshTokenExp; }
  get passwordResetToken(): string | undefined { return this.props.passwordResetToken; }
  get passwordResetExp(): Date | undefined { return this.props.passwordResetExp; }
  get isDeleted(): boolean { return this.props.isDeleted; }
  get createdById(): string { return this.props.createdById; }

  get isLocked(): boolean {
    return this.props.lockedUntil ? new Date() < this.props.lockedUntil : false;
  }

  // ─── Business Methods ────────────────────────────────────

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.props.passwordHash);
  }

  recordFailedLogin(): void {
    this.props.failedAttempts++;
    if (this.props.failedAttempts >= 5) {
      // Lock for 30 minutes
      this.props.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
    }
    this.touch();
  }

  recordSuccessfulLogin(): void {
    this.props.failedAttempts = 0;
    this.props.lockedUntil = undefined;
    this.props.isFirstLogin = false;
    this.props.loginCount++;
    this.props.lastLoginAt = new Date();
    this.touch();
  }

  setRefreshToken(token: string, expiresIn: number): void {
    this.props.refreshToken = token;
    this.props.refreshTokenExp = new Date(Date.now() + expiresIn * 1000);
    this.touch();
  }

  clearRefreshToken(): void {
    this.props.refreshToken = undefined;
    this.props.refreshTokenExp = undefined;
    this.touch();
  }

  setPasswordResetToken(token: string): void {
    this.props.passwordResetToken = token;
    this.props.passwordResetExp = new Date(Date.now() + 60 * 60 * 1000); // 1h
    this.touch();
  }

  async resetPassword(newPassword: string): Promise<ResultType<void>> {
    if (!newPassword || newPassword.length < 8) {
      return Err('CP_004', 'Password must be at least 8 characters');
    }
    this.props.passwordHash = await bcrypt.hash(newPassword, 12);
    this.props.passwordResetToken = undefined;
    this.props.passwordResetExp = undefined;
    this.touch();
    return Ok(undefined);
  }

  activate(): void {
    this.props.isActive = true;
    this.touch();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.touch();
  }

  updateMenuCategory(menuCategoryId: string | undefined): void {
    this.props.menuCategoryId = menuCategoryId;
    this.touch();
  }

  updatePageOverrides(overrides: Record<string, boolean>): void {
    this.props.pageOverrides = { ...this.props.pageOverrides, ...overrides };
    this.touch();
  }

  /**
   * Resolve the final visible routes:
   * category defaults + per-user overrides applied.
   */
  resolveMenu(categoryRoutes: string[]): string[] {
    const overrides = this.props.pageOverrides;
    return categoryRoutes.filter((route) => {
      if (route in overrides) return overrides[route];
      return true; // category default = visible
    });
  }

  softDelete(): void {
    this.props.isDeleted = true;
    this.props.isActive = false;
    this.touch();
  }
}
