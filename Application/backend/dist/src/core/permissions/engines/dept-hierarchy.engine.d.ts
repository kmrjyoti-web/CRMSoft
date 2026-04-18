import { PrismaService } from '../../prisma/prisma.service';
import { PermissionContext } from '../types/permission-context';
export declare class DeptHierarchyEngine {
    private readonly prisma;
    constructor(prisma: PrismaService);
    check(ctx: PermissionContext): Promise<boolean>;
    canAccess(actorPath: string, resourcePath: string): boolean;
    isAncestor(ancestorPath: string, descendantPath: string): boolean;
    isSibling(pathA: string, pathB: string): boolean;
    getDepth(path: string): number;
    private getDeptPath;
    private getResourceDeptPath;
    private normalizePath;
}
