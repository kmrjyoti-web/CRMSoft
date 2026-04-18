export interface ShortcutSeedItem {
    code: string;
    label: string;
    description?: string;
    category: string;
    actionType: string;
    targetPath?: string;
    targetModule?: string;
    targetFunction?: string;
    defaultKey: string;
    isLocked?: boolean;
    isSystem?: boolean;
    sortOrder: number;
}
export declare const SHORTCUT_DEFINITIONS: ShortcutSeedItem[];
