/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'domain-no-infrastructure',
      comment: 'Domain layer must NOT import from infrastructure (DDD: pure domain, no adapters)',
      severity: 'error',
      from: { path: '^src/modules/.*/domain/' },
      to: { path: '^src/modules/.*/infrastructure/' },
    },
    {
      name: 'domain-no-presentation',
      comment: 'Domain layer must NOT import from presentation layer',
      severity: 'error',
      from: { path: '^src/modules/.*/domain/' },
      to: { path: '^src/modules/.*/presentation/' },
    },
    {
      name: 'domain-no-nestjs',
      comment: 'Domain layer should be pure TypeScript (no NestJS framework coupling)',
      severity: 'warn',
      from: { path: '^src/modules/.*/domain/' },
      to: { path: '^node_modules/@nestjs/' },
    },
    {
      name: 'presentation-no-infrastructure',
      comment: 'Presentation layer should go through Application (CommandBus/QueryBus), not directly to Infrastructure',
      severity: 'warn',
      from: { path: '^src/modules/.*/presentation/' },
      to: { path: '^src/modules/.*/infrastructure/' },
    },
    {
      name: 'application-no-presentation',
      comment: 'Application layer must NOT import from presentation',
      severity: 'error',
      from: { path: '^src/modules/.*/application/' },
      to: { path: '^src/modules/.*/presentation/' },
    },
    {
      name: 'no-circular',
      comment: 'No circular dependencies allowed anywhere',
      severity: 'error',
      from: {},
      to: { circular: true },
    },

    // ─── SERVICE BOUNDARY RULES ───────────────────────────────────────────────
    // Severity: 'warn' in monolith mode.
    // When extracting a service, change the relevant rule to 'error' and
    // replace each @CrossService-annotated import with an API call or event.

    {
      name: 'vendor-no-direct-work',
      comment:
        'Vendor service must not directly import Work service modules. ' +
        'Each violation is annotated with @CrossService. ' +
        'When extracting, replace with message queue or HTTP call.',
      severity: 'warn',
      from: {
        path: '^src/modules/(softwarevendor|plugins|marketplace)|^src/modules/core/platform',
      },
      to: {
        path: '^src/modules/customer|^src/core/workflow|^src/modules/core/work',
      },
    },
    {
      name: 'work-no-direct-vendor',
      comment:
        'Work service must not directly import Vendor service modules (table-config, tenant-config, control-room). ' +
        'Each violation is annotated with @CrossService. ' +
        'When extracting, replace with shared-lib or HTTP call.',
      severity: 'warn',
      from: {
        path: '^src/modules/customer|^src/core/workflow|^src/modules/core/work',
      },
      to: {
        path: '^src/modules/(softwarevendor|plugins|marketplace)|^src/modules/core/platform',
      },
    },
    {
      name: 'work-no-direct-identity-business',
      comment:
        'Work service must not import business-logic services from Identity (AutoNumberService, CompanyProfileService, MakerCheckerEngine). ' +
        'Shared infrastructure (RequirePermissions decorator, guards) is exempt. ' +
        'Each violation is annotated with @CrossService. ' +
        'When extracting, replace with HTTP call or event.',
      severity: 'warn',
      from: {
        path: '^src/modules/customer|^src/core/workflow|^src/modules/core/work',
      },
      to: {
        // Business-logic identity services (excludes shared decorators/guards)
        path:
          '^src/modules/core/identity/settings|' +
          '^src/core/permissions/engines',
      },
    },
    {
      name: 'identity-no-direct-vendor',
      comment:
        'Identity service must not directly import Vendor business-logic. ' +
        'Static seed-data imports are annotated with @CrossService and acceptable in monolith. ' +
        'When extracting, move seed data to shared constants package.',
      severity: 'warn',
      from: {
        path: '^src/core/auth|^src/core/permissions|^src/modules/core/identity',
      },
      to: {
        path: '^src/modules/(softwarevendor|plugins|marketplace)|^src/modules/core/platform',
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    reporterOptions: {
      text: {
        highlightFocused: true,
      },
    },
  },
};
