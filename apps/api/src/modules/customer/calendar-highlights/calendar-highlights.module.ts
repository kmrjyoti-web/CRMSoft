import { Module } from '@nestjs/common';
import { CalendarHighlightsController } from './calendar-highlights.controller';
import { CalendarHighlightsService } from './calendar-highlights.service';

@Module({
  controllers: [CalendarHighlightsController],
  providers: [CalendarHighlightsService],
  exports: [CalendarHighlightsService],
})
export class CalendarHighlightsModule {}
