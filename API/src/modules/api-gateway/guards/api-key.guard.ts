import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiKeyService } from '../services/api-key.service';
import { AppError } from '../../../common/errors/app-error';
import { API_PUBLIC_KEY } from '../decorators/api-public.decorator';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly apiKeyService: ApiKeyService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public (no API key needed)
    const isPublic = this.reflector.getAllAndOverride<boolean>(API_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['x-api-key'] || request.headers['authorization'];

    if (!authHeader) {
      throw AppError.from('AUTH_TOKEN_MISSING').withDetails({
        hint: 'Provide API key via X-Api-Key header or Authorization: Bearer <key>',
      });
    }

    const rawKey = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

    const result = await this.apiKeyService.validate(rawKey);
    if (!result) {
      throw AppError.from('AUTH_TOKEN_INVALID');
    }

    const { apiKey, tenantId } = result;

    // Check IP allowlist
    const clientIp = request.ip || request.connection?.remoteAddress || '0.0.0.0';
    if (!this.apiKeyService.isIpAllowed(apiKey, clientIp)) {
      throw AppError.from('API_KEY_IP_BLOCKED').withDetails({ ip: clientIp });
    }

    // Attach to request for downstream use
    request.apiKey = apiKey;
    request.tenantId = tenantId;
    request.apiKeyId = apiKey.id;
    request.apiKeyName = apiKey.name;
    request.apiKeyScopes = apiKey.scopes;

    return true;
  }
}
