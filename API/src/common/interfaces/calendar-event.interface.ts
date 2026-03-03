export interface CalendarEventInput {
  eventType: string;
  sourceId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  allDay?: boolean;
  color?: string;
  userId: string;
}
