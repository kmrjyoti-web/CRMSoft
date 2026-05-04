export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
  VIEWER = 'VIEWER',
}

export enum EntityType {
  LEAD = 'lead',
  CONTACT = 'contact',
  ORGANIZATION = 'organization',
  QUOTATION = 'quotation',
  ORDER = 'order',
  INVOICE = 'invoice',
  PRODUCT = 'product',
}

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
  DRAFT = 'DRAFT',
  ARCHIVED = 'ARCHIVED',
}
