import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class MenuEditorService {
  constructor(private readonly db: PlatformConsolePrismaService) {}

  async getMenusForVertical(verticalCode: string) {
    const vertical = await this.db.pc_vertical_v2.findUnique({ where: { vertical_code: verticalCode } });
    if (!vertical) throw new HttpException('Vertical not found', HttpStatus.NOT_FOUND);

    return this.db.pc_vertical_menu.findMany({
      where: { vertical_id: vertical.id },
      orderBy: { sort_order: 'asc' },
    });
  }

  async createMenu(verticalCode: string, data: {
    menu_code: string;
    menu_label: string;
    menu_description?: string;
    icon_name?: string;
    route?: string;
    module_id?: string | null;
    parent_menu_id?: string | null;
    sort_order?: number;
    depth_level?: number;
    is_visible?: boolean;
    is_enabled?: boolean;
    badge_type?: string | null;
    badge_value?: string | null;
  }) {
    const vertical = await this.db.pc_vertical_v2.findUnique({ where: { vertical_code: verticalCode } });
    if (!vertical) throw new HttpException('Vertical not found', HttpStatus.NOT_FOUND);

    const existing = await this.db.pc_vertical_menu.findUnique({
      where: { vertical_id_menu_code: { vertical_id: vertical.id, menu_code: data.menu_code } },
    });
    if (existing) throw new HttpException(`Menu code '${data.menu_code}' already exists in this vertical`, HttpStatus.CONFLICT);

    return this.db.pc_vertical_menu.create({
      data: {
        id: randomUUID(),
        vertical_id: vertical.id,
        menu_code: data.menu_code,
        menu_label: data.menu_label,
        menu_description: data.menu_description ?? null,
        icon_name: data.icon_name ?? null,
        route: data.route ?? null,
        module_id: data.module_id ?? null,
        parent_menu_id: data.parent_menu_id ?? null,
        sort_order: data.sort_order ?? 0,
        depth_level: data.depth_level ?? 0,
        is_visible: data.is_visible ?? true,
        is_enabled: data.is_enabled ?? true,
        badge_type: data.badge_type ?? null,
        badge_value: data.badge_value ?? null,
        updated_at: new Date(),
      },
    });
  }

  async updateMenu(menuId: string, data: Record<string, unknown>) {
    const allowed = [
      'menu_label', 'menu_description', 'icon_name', 'route',
      'module_id', 'parent_menu_id', 'sort_order', 'depth_level',
      'is_visible', 'is_enabled', 'hide_if_empty',
      'badge_type', 'badge_value',
      'permissions_required', 'roles_allowed', 'features_required',
    ];
    const update: Record<string, unknown> = { updated_at: new Date() };
    for (const key of allowed) {
      if (data[key] !== undefined) update[key] = data[key];
    }
    return this.db.pc_vertical_menu.update({ where: { id: menuId }, data: update });
  }

  async deleteMenu(menuId: string) {
    const menu = await this.db.pc_vertical_menu.findUnique({ where: { id: menuId } });
    if (!menu) throw new HttpException('Menu not found', HttpStatus.NOT_FOUND);

    // Re-parent children to the deleted menu's parent before deleting
    await this.db.pc_vertical_menu.updateMany({
      where: { parent_menu_id: menuId },
      data: { parent_menu_id: menu.parent_menu_id ?? null },
    });

    return this.db.pc_vertical_menu.delete({ where: { id: menuId } });
  }

  async bulkUpdateOrder(verticalCode: string, updates: Array<{
    id: string;
    parent_menu_id?: string | null;
    sort_order?: number;
    depth_level?: number;
  }>) {
    const vertical = await this.db.pc_vertical_v2.findUnique({ where: { vertical_code: verticalCode } });
    if (!vertical) throw new HttpException('Vertical not found', HttpStatus.NOT_FOUND);

    return this.db.$transaction(
      updates.map((u) =>
        this.db.pc_vertical_menu.update({
          where: { id: u.id },
          data: {
            ...(u.parent_menu_id !== undefined && { parent_menu_id: u.parent_menu_id }),
            ...(u.sort_order !== undefined && { sort_order: u.sort_order }),
            ...(u.depth_level !== undefined && { depth_level: u.depth_level }),
            updated_at: new Date(),
          },
        }),
      ),
    );
  }

  async validateRoute(verticalCode: string, route: string, excludeMenuId?: string) {
    const vertical = await this.db.pc_vertical_v2.findUnique({ where: { vertical_code: verticalCode } });
    if (!vertical) throw new HttpException('Vertical not found', HttpStatus.NOT_FOUND);

    const existing = await this.db.pc_vertical_menu.findFirst({
      where: {
        vertical_id: vertical.id,
        route,
        ...(excludeMenuId ? { NOT: { id: excludeMenuId } } : {}),
      },
    });

    return {
      isValid: !existing,
      message: existing
        ? `Route "${route}" is already used by "${existing.menu_label}"`
        : 'Route is available',
    };
  }
}
