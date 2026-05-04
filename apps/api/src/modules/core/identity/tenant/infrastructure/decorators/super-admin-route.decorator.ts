import { SetMetadata } from '@nestjs/common';

export const IS_SUPER_ADMIN_ROUTE = 'isSuperAdminRoute';
export const SuperAdminRoute = () => SetMetadata(IS_SUPER_ADMIN_ROUTE, true);
