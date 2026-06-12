export interface CalendarHighlight {
  id: string;
  date: string;
  title: string;
  highlightType: string;
  color: string;
  isHoliday: boolean;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export type DatePickerMode = 'single' | 'range' | 'datetime' | 'time';

export interface AICDatePickerProps {
  // Value
  value?: Date | string | null;
  dateRange?: DateRange;
  onChange?: (date: Date | string | null) => void;
  onRangeChange?: (range: DateRange | null) => void;

  // Mode
  mode?: DatePickerMode;

  // Display
  label?: string;
  placeholder?: string;
  format?: string;
  timeFormat?: '12h' | '24h';

  // Features
  showPresets?: boolean;
  showTime?: boolean;
  showHighlights?: boolean;
  highlightTypes?: string[];

  // Validation
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  disabledDays?: number[];
  required?: boolean;

  // Styling
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  error?: string;
  className?: string;
  dropdownAlign?: 'left' | 'right';

  // Financial year
  financialYearStart?: number;
}

export interface PresetItem {
  label: string;
  getValue: () => DateRange;
}
