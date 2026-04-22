/**
 * Injection token for PrismaService in @crmsoft/core-platform.
 *
 * The host app (apps-backend/api) must register a provider:
 *   { provide: PLATFORM_PRISMA, useExisting: PrismaService }
 *
 * All platform module handlers use @Optional() @Inject(PLATFORM_PRISMA)
 * so the package compiles without a hard PrismaService import.
 */
export const PLATFORM_PRISMA = Symbol('PLATFORM_PRISMA');

/**
 * Minimal interface covering the platform DB accessor used by help + lookups modules.
 * Keeps @crmsoft/core-platform free of @prisma/* type dependencies.
 */
export interface IPlatformPrisma {
  /** Run multiple operations in a single transaction */
  $transaction(operations: Promise<any>[]): Promise<any[]>;

  platform: {
    helpArticle: {
      findMany(args?: any): Promise<any[]>;
      findUnique(args: any): Promise<any | null>;
      count(args?: any): Promise<number>;
      create(args: any): Promise<any>;
      update(args: any): Promise<any>;
    };
    masterLookup: {
      findFirst(args?: any): Promise<any | null>;
      findUnique(args: any): Promise<any | null>;
      findMany(args?: any): Promise<any[]>;
      create(args: any): Promise<any>;
      update(args: any): Promise<any>;
      upsert(args: any): Promise<any>;
    };
    lookupValue: {
      findFirst(args?: any): Promise<any | null>;
      findUnique(args: any): Promise<any | null>;
      findMany(args?: any): Promise<any[]>;
      create(args: any): Promise<any>;
      update(args: any): Promise<any>;
      updateMany(args: any): Promise<any>;
      upsert(args: any): Promise<any>;
      aggregate(args: any): Promise<{ _max: Record<string, any> }>;
    };
  };
}
