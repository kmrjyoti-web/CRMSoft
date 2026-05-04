import { AggregateRoot } from '../../../../../../shared/domain/aggregate-root';

export interface CreateUserProps {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  status?: string;
  userType?: string;
  roleId: string;
  departmentId?: string;
  designationId?: string;
  reportingToId?: string;
  employeeCode?: string;
  joiningDate?: Date;
  createdBy?: string;
}

/**
 * User Aggregate Root.
 * Uses status enum (ACTIVE, INACTIVE, SUSPENDED) instead of isActive boolean.
 * Contains business rules for user lifecycle.
