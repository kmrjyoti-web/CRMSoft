import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { PermissionChainService } from '../../permissions/services/permission-chain.service';
import { ApiResponse } from '../../../common/utils/api-response';

const mockAuthService = {
  adminLogin: jest.fn(),
  employeeLogin: jest.fn(),
  customerLogin: jest.fn(),
  partnerLogin: jest.fn(),
  vendorLogin: jest.fn(),
  superAdminLogin: jest.fn(),
  registerCustomer: jest.fn(),
  registerPartner: jest.fn(),
  isSlugAvailable: jest.fn(),
  registerTenant: jest.fn(),
  registerStaff: jest.fn(),
  refreshToken: jest.fn(),
  changePassword: jest.fn(),
  getProfile: jest.fn(),
  getVendorProfile: jest.fn(),
  getSuperAdminProfile: jest.fn(),
};

const mockPermissionChain = {
  getAllPermissionCodes: jest.fn(),
  getEffectivePermissions: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuthController(
      mockAuthService as unknown as AuthService,
      mockPermissionChain as unknown as PermissionChainService,
    );
  });

  const loginDto = { email: 'test@crm.com', password: 'Pass@123' };
  const tokenResult = { user: { id: 'u-1' }, accessToken: 'tok', refreshToken: 'ref' };

  describe('adminLogin()', () => {
    it('should return success with tokens', async () => {
      mockAuthService.adminLogin.mockResolvedValue(tokenResult);
      const result = await controller.adminLogin(loginDto);
      expect(mockAuthService.adminLogin).toHaveBeenCalledWith(loginDto.email, loginDto.password);
      expect(result).toEqual(ApiResponse.success(tokenResult, 'Admin login successful'));
    });

    it('should propagate errors from AuthService', async () => {
      mockAuthService.adminLogin.mockRejectedValue(new Error('Invalid credentials'));
      await expect(controller.adminLogin(loginDto)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('employeeLogin()', () => {
    it('should return success with tokens', async () => {
      mockAuthService.employeeLogin.mockResolvedValue(tokenResult);
      const result = await controller.employeeLogin(loginDto);
      expect(result).toEqual(ApiResponse.success(tokenResult, 'Employee login successful'));
    });
  });

  describe('customerLogin()', () => {
    it('should return success with tokens', async () => {
      mockAuthService.customerLogin.mockResolvedValue(tokenResult);
      const result = await controller.customerLogin(loginDto);
      expect(result).toEqual(ApiResponse.success(tokenResult, 'Customer login successful'));
    });
  });

  describe('partnerLogin()', () => {
    it('should return success with tokens', async () => {
      mockAuthService.partnerLogin.mockResolvedValue(tokenResult);
      const result = await controller.partnerLogin(loginDto);
      expect(result).toEqual(ApiResponse.success(tokenResult, 'Partner login successful'));
    });
  });

  describe('vendorLogin()', () => {
    it('should return success with vendor tokens', async () => {
      mockAuthService.vendorLogin.mockResolvedValue({ ...tokenResult, vendor: { id: 'v-1' } });
      const result = await controller.vendorLogin(loginDto);
      expect(result).toEqual(ApiResponse.success({ ...tokenResult, vendor: { id: 'v-1' } }, 'Vendor login successful'));
    });
  });

  describe('superAdminLogin()', () => {
    it('should return success with super admin tokens', async () => {
      mockAuthService.superAdminLogin.mockResolvedValue(tokenResult);
      const result = await controller.superAdminLogin(loginDto);
      expect(result).toEqual(ApiResponse.success(tokenResult, 'Super admin login successful'));
    });
  });

  describe('checkSlug()', () => {
    it('should return available=true when slug is free', async () => {
      mockAuthService.isSlugAvailable.mockResolvedValue(true);
      const result = await controller.checkSlug('my-company');
      expect(result).toEqual(ApiResponse.success({ available: true }));
    });

    it('should return available=false when slug is taken', async () => {
      mockAuthService.isSlugAvailable.mockResolvedValue(false);
      const result = await controller.checkSlug('taken-slug');
      expect(result).toEqual(ApiResponse.success({ available: false }));
    });
  });

  describe('customerRegister()', () => {
    it('should register customer and return result', async () => {
      const dto = { email: 'c@g.com', password: 'P@ss1', firstName: 'Raj', lastName: 'K' };
      mockAuthService.registerCustomer.mockResolvedValue({ user: { id: 'u-5' }, accessToken: 'tok' });
      const result = await controller.customerRegister(dto as any);
      expect(mockAuthService.registerCustomer).toHaveBeenCalledWith(dto);
      expect((result as any).data.user.id).toBe('u-5');
    });
  });

  describe('refresh()', () => {
    it('should return new tokens', async () => {
      mockAuthService.refreshToken.mockResolvedValue({ accessToken: 'new-tok', refreshToken: 'new-ref' });
      const result = await controller.refresh({ refreshToken: 'old-ref' });
      expect(result).toEqual(ApiResponse.success({ accessToken: 'new-tok', refreshToken: 'new-ref' }, 'Token refreshed'));
    });

    it('should propagate invalid token error', async () => {
      mockAuthService.refreshToken.mockRejectedValue(new Error('Invalid refresh token'));
      await expect(controller.refresh({ refreshToken: 'bad' })).rejects.toThrow('Invalid refresh token');
    });
  });

  describe('changePassword()', () => {
    it('should change password successfully', async () => {
      mockAuthService.changePassword.mockResolvedValue({ message: 'Password changed' });
      const dto = { currentPassword: 'old', newPassword: 'new' };
      const result = await controller.changePassword(dto as any, 'u-1');
      expect(mockAuthService.changePassword).toHaveBeenCalledWith('u-1', 'old', 'new');
      expect((result as any).data.message).toBe('Password changed');
    });
  });

  describe('permissions()', () => {
    it('should return all permissions for super admin', async () => {
      mockPermissionChain.getAllPermissionCodes.mockResolvedValue(['READ', 'WRITE']);
      const result = await controller.permissions({ isSuperAdmin: true });
      expect(mockPermissionChain.getAllPermissionCodes).toHaveBeenCalled();
      expect((result as any).data).toEqual(['READ', 'WRITE']);
    });

    it('should return all permissions for vendor', async () => {
      mockPermissionChain.getAllPermissionCodes.mockResolvedValue(['READ', 'WRITE']);
      const result = await controller.permissions({ userType: 'VENDOR' });
      expect(mockPermissionChain.getAllPermissionCodes).toHaveBeenCalled();
    });

    it('should return effective permissions for regular user', async () => {
      mockPermissionChain.getEffectivePermissions.mockResolvedValue(['READ']);
      const result = await controller.permissions({ id: 'u-1' });
      expect(mockPermissionChain.getEffectivePermissions).toHaveBeenCalledWith('u-1');
      expect((result as any).data).toEqual(['READ']);
    });
  });

  describe('me()', () => {
    it('should return super admin profile', async () => {
      mockAuthService.getSuperAdminProfile.mockResolvedValue({ id: 'sa-1', email: 'sa@crm.com' });
      const result = await controller.me({ isSuperAdmin: true, id: 'sa-1' });
      expect(mockAuthService.getSuperAdminProfile).toHaveBeenCalledWith('sa-1');
    });

    it('should return vendor profile', async () => {
      mockAuthService.getVendorProfile.mockResolvedValue({ id: 'v-1', userType: 'VENDOR' });
      const result = await controller.me({ vendorId: 'v-1' });
      expect(mockAuthService.getVendorProfile).toHaveBeenCalledWith('v-1');
    });

    it('should return regular user profile', async () => {
      mockAuthService.getProfile.mockResolvedValue({ id: 'u-1', email: 'user@crm.com' });
      const result = await controller.me({ id: 'u-1' });
      expect(mockAuthService.getProfile).toHaveBeenCalledWith('u-1');
    });
  });
});
