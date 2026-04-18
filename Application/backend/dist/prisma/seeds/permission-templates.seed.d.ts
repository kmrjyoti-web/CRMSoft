import { PrismaClient } from '@prisma/client';
interface TemplateSeed {
    name: string;
    code: string;
    description: string;
    isSystem: boolean;
    isDefault: boolean;
    permissions: Record<string, Record<string, boolean>>;
}
export declare const PERMISSION_TEMPLATES: TemplateSeed[];
export declare function seedPermissionTemplates(prisma: PrismaClient): Promise<number>;
export {};
