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
