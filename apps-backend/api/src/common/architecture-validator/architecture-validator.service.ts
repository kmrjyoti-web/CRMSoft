import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

/**
 * Layer 4: Runtime Architecture Validator
 * Runs on app startup via onModuleInit().
 * Validates vertical registry completeness and module structure.
 * Logs warnings only — never crashes the app.
 *
 * Registration: Add ArchitectureValidatorService to providers[]
 * in Application/backend/src/app.module.ts
 */
@Injectable()
export class ArchitectureValidatorService implements OnModuleInit {
  private readonly logger = new Logger(ArchitectureValidatorService.name);

  onModuleInit() {
    this.logger.log('Running architecture validation...');
    this.validateVerticalRegistry();
    this.logger.log('Architecture validation complete');
  }

  private validateVerticalRegistry() {
    try {
      // Dynamically require to avoid hard dependency at import time
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { VERTICAL_SCHEMAS } = require('../vertical-registry/vertical-registry');

      const requiredEntities = ['CONTACT', 'LEAD', 'PRODUCT'];
      const requiredBusinessTypes = ['SOFTWARE_VENDOR', 'PHARMA', 'TOURISM', 'RESTAURANT', 'RETAIL', 'GENERAL'];
      const missing: string[] = [];

      for (const entity of requiredEntities) {
        if (!VERTICAL_SCHEMAS[entity]) {
          missing.push(`${entity} has no schema`);
          continue;
        }
        for (const bt of requiredBusinessTypes) {
          if (!VERTICAL_SCHEMAS[entity][bt]) {
            missing.push(`${entity}.${bt} schema missing`);
          }
        }
      }

      if (missing.length > 0) {
        this.logger.warn(`  ⚠️  Vertical registry gaps: ${missing.join(', ')}`);
      } else {
        this.logger.log('  ✅ Vertical registry: all entities × business types covered');
      }
    } catch (err) {
      this.logger.warn('  ⚠️  Vertical registry not found — skipping validation');
    }
  }
}
