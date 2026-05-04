import { Injectable, Logger, Optional, Inject } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { getErrorMessage } from '@/common/utils/error.utils';

export interface ErrorLogEntry {
  requestId: string;
  errorCode: string;
  message: string;
  statusCode: number;
  path: string;
  method: string;
  layer?: 'BE' | 'FE' | 'DB' | 'MOB';
  severity?: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  userId?: string;
  tenantId?: string;
  details?: Record<string, unknown>;
  stack?: string;
  ip?: string;
  userAgent?: string;
  module?: string;
  requestBody?: Record<string, unknown>;
  queryParams?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  requestHeaders?: Record<string, unknown>;
  responseBody?: Record<string, unknown>;
  responseTimeMs?: number;
  userName?: string;
  userRole?: string;
  tenantName?: string;
  industryCode?: string;
}

/** Sensitive keys to redact from request bodies. */
const SENSITIVE_KEYS = ['password', 'token', 'secret', 'authorization', 'apiKey', 'accessToken', 'refreshToken'];

/** Error codes that always get persisted regardless of HTTP status. */
const ALWAYS_PERSIST_CODES = ['AUTH_TOKEN_INVALID', 'AUTH_TOKEN_EXPIRED', 'UNAUTHORIZED', 'FORBIDDEN', 'RATE_LIMIT_EXCEEDED'];

/**
 * Logs errors to both console and database (fire-and-forget).
