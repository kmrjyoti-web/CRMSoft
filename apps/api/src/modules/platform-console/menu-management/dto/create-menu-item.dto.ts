export class CreateMenuItemDto {
  menuKey: string;
  label: string;
  labelHi: string;
  icon?: string;
  parentKey?: string;
  route?: string;
  moduleCode?: string;
  verticalType?: string;
  sortOrder?: number;
}
