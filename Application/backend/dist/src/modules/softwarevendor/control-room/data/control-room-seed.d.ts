import { PrismaService } from '../../../../core/prisma/prisma.service';
export interface SelectOption {
    label: string;
    value: string;
}
export interface ControlRoomRuleDefinition {
    ruleCode: string;
    category: string;
    subCategory?: string;
    label: string;
    description?: string;
    valueType: 'BOOLEAN' | 'STRING' | 'NUMBER' | 'SELECT' | 'MULTI_SELECT';
    defaultValue: string;
    selectOptions?: SelectOption[];
    minValue?: number;
    maxValue?: number;
    sortOrder: number;
    allowedLevels: string;
    industrySpecific: boolean;
}
export declare const CONTROL_ROOM_RULES: ControlRoomRuleDefinition[];
export declare function seedControlRoomRules(prisma: PrismaService): Promise<void>;
