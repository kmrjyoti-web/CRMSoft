/**
 * @shared-types — Shared TypeScript types for CRM-SOFT frontend apps.
 *
 * Usage (after tsconfig path alias is configured):
 *   import type { Lead, LeadStatus, ApiResponse, Paginated } from '@shared-types';
 */

// Core API response wrapper
export type {
  ApiResponse,
  ApiErrorBody,
  ApiErrorResponse,
  PaginationMeta,
  Paginated,
  ResultType,
} from './common/api-response';
export { isApiSuccess, isApiError, isOk, isErr } from './common/api-response';

// All 212 enum types from Prisma schemas
export type * from './enums';

// Core entity interfaces
export type {
  UserRef,
  ContactRef,
  OrganizationRef,
  User,
  Lead,
  Contact,
  Organization,
  Product,
  QuotationLineItem,
  Quotation,
  Activity,
  RawContact,
  Invoice,
  Payment,
  Task,
  Demo,
  TourPlan,
  SupportTicket,
  CustomerUser,
  CustomerMenuCategory,
  PortalRoute,
  EligibleEntity,
  PortalAnalytics,
  PortalLog,
  ActivatePortalDto,
  CreateMenuCategoryDto,
  UpdateMenuCategoryDto,
  UpdatePortalUserDto,
} from './entities';

// Request DTO interfaces
export type {
  PaginationQuery,
  CreateLeadDto,
  UpdateLeadDto,
  LeadQueryDto,
  CreateContactDto,
  UpdateContactDto,
  ContactQueryDto,
  CreateOrganizationDto,
  UpdateOrganizationDto,
  OrganizationQueryDto,
  CreateActivityDto,
  UpdateActivityDto,
  ActivityQueryDto,
  QuotationLineItemDto,
  CreateQuotationDto,
  UpdateQuotationDto,
  QuotationQueryDto,
  CreateTaskDto,
  UpdateTaskDto,
  TaskQueryDto,
  CreateDemoDto,
  UpdateDemoDto,
  DemoQueryDto,
  CreateTourPlanDto,
  UpdateTourPlanDto,
  TourPlanQueryDto,
} from './dto';
