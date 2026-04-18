"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerUserEntity = void 0;
const ddd_1 = require("../../../../common/ddd");
const types_1 = require("../../../../common/types");
const bcrypt = require("bcrypt");
class CustomerUserEntity extends ddd_1.BaseEntity {
    constructor(id, tenantId, props) {
        super(id, tenantId, props);
    }
    static async create(id, tenantId, props) {
        if (!props.email || !props.email.includes('@')) {
            return (0, types_1.Err)('CP_001', 'Valid email is required');
        }
        if (!props.password || props.password.length < 8) {
            return (0, types_1.Err)('CP_002', 'Password must be at least 8 characters');
        }
        if (!props.linkedEntityId) {
            return (0, types_1.Err)('CP_003', 'Linked entity is required');
        }
        const passwordHash = await bcrypt.hash(props.password, 12);
        return (0, types_1.Ok)(new CustomerUserEntity(id, tenantId, {
            ...props,
            passwordHash,
            pageOverrides: {},
            failedAttempts: 0,
            loginCount: 0,
            isFirstLogin: true,
            isDeleted: false,
        }));
    }
    static fromPersistence(id, tenantId, props, createdAt, updatedAt) {
        const entity = new CustomerUserEntity(id, tenantId, props);
        entity.setTimestamps(createdAt, updatedAt);
        return entity;
    }
    get email() { return this.props.email; }
    get phone() { return this.props.phone; }
    get passwordHash() { return this.props.passwordHash; }
    get linkedEntityType() { return this.props.linkedEntityType; }
    get linkedEntityId() { return this.props.linkedEntityId; }
    get linkedEntityName() { return this.props.linkedEntityName; }
    get displayName() { return this.props.displayName; }
    get avatarUrl() { return this.props.avatarUrl; }
    get companyName() { return this.props.companyName; }
    get gstin() { return this.props.gstin; }
    get menuCategoryId() { return this.props.menuCategoryId; }
    get pageOverrides() { return this.props.pageOverrides; }
    get lastLoginAt() { return this.props.lastLoginAt; }
    get isActive() { return this.props.isActive; }
    get isFirstLogin() { return this.props.isFirstLogin; }
    get loginCount() { return this.props.loginCount; }
    get failedAttempts() { return this.props.failedAttempts; }
    get lockedUntil() { return this.props.lockedUntil; }
    get refreshToken() { return this.props.refreshToken; }
    get refreshTokenExp() { return this.props.refreshTokenExp; }
    get passwordResetToken() { return this.props.passwordResetToken; }
    get passwordResetExp() { return this.props.passwordResetExp; }
    get isDeleted() { return this.props.isDeleted; }
    get createdById() { return this.props.createdById; }
    get isLocked() {
        return this.props.lockedUntil ? new Date() < this.props.lockedUntil : false;
    }
    async validatePassword(password) {
        return bcrypt.compare(password, this.props.passwordHash);
    }
    recordFailedLogin() {
        this.props.failedAttempts++;
        if (this.props.failedAttempts >= 5) {
            this.props.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
        }
        this.touch();
    }
    recordSuccessfulLogin() {
        this.props.failedAttempts = 0;
        this.props.lockedUntil = undefined;
        this.props.isFirstLogin = false;
        this.props.loginCount++;
        this.props.lastLoginAt = new Date();
        this.touch();
    }
    setRefreshToken(token, expiresIn) {
        this.props.refreshToken = token;
        this.props.refreshTokenExp = new Date(Date.now() + expiresIn * 1000);
        this.touch();
    }
    clearRefreshToken() {
        this.props.refreshToken = undefined;
        this.props.refreshTokenExp = undefined;
        this.touch();
    }
    setPasswordResetToken(token) {
        this.props.passwordResetToken = token;
        this.props.passwordResetExp = new Date(Date.now() + 60 * 60 * 1000);
        this.touch();
    }
    async resetPassword(newPassword) {
        if (!newPassword || newPassword.length < 8) {
            return (0, types_1.Err)('CP_004', 'Password must be at least 8 characters');
        }
        this.props.passwordHash = await bcrypt.hash(newPassword, 12);
        this.props.passwordResetToken = undefined;
        this.props.passwordResetExp = undefined;
        this.touch();
        return (0, types_1.Ok)(undefined);
    }
    activate() {
        this.props.isActive = true;
        this.touch();
    }
    deactivate() {
        this.props.isActive = false;
        this.touch();
    }
    updateMenuCategory(menuCategoryId) {
        this.props.menuCategoryId = menuCategoryId;
        this.touch();
    }
    updatePageOverrides(overrides) {
        this.props.pageOverrides = { ...this.props.pageOverrides, ...overrides };
        this.touch();
    }
    resolveMenu(categoryRoutes) {
        const overrides = this.props.pageOverrides;
        return categoryRoutes.filter((route) => {
            if (route in overrides)
                return overrides[route];
            return true;
        });
    }
    softDelete() {
        this.props.isDeleted = true;
        this.props.isActive = false;
        this.touch();
    }
}
exports.CustomerUserEntity = CustomerUserEntity;
//# sourceMappingURL=customer-user.entity.js.map