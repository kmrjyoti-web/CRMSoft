import { Injectable } from '@nestjs/common';
import { CronExpressionParser } from 'cron-parser';

/** Parses cron expressions and calculates next run times. */
@Injectable()
export class CronParserService {
  /** Validate a cron expression. Returns true if valid. */
  isValid(expression: string): boolean {
    try {
      CronExpressionParser.parse(expression);
      return true;
    } catch {
      return false;
    }
  }

  /** Calculate the next run time from a cron expression. */
  getNextRun(expression: string, timezone?: string): Date {
    const interval = CronExpressionParser.parse(expression, {
      tz: timezone || 'Asia/Kolkata',
    });
    return interval.next().toDate();
  }

  /** Calculate multiple upcoming run times. */
  getNextRuns(expression: string, count: number, timezone?: string): Date[] {
    const interval = CronExpressionParser.parse(expression, {
      tz: timezone || 'Asia/Kolkata',
    });
    const runs: Date[] = [];
    for (let i = 0; i < count; i++) {
      runs.push(interval.next().toDate());
    }
    return runs;
  }

  /** Generate a human-readable description of a cron expression. */
  describe(expression: string): string {
    const parts = expression.split(' ');
    if (parts.length < 5) return expression;

    const [min, hour, dom, mon, dow] = parts;

    if (min.startsWith('*/') && hour === '*')
      return `Every ${min.slice(2)} minutes`;
    if (min === '0' && hour.startsWith('*/'))
      return `Every ${hour.slice(2)} hours`;
    if (min === '0' && hour !== '*' && dom === '*' && dow === '*')
      return `Daily at ${hour.padStart(2, '0')}:00`;
    if (min !== '*' && hour !== '*' && dom === '*' && dow !== '*')
      return `${this.dowName(dow)} at ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`;
    if (min !== '*' && hour !== '*' && dom !== '*' && mon === '*')
      return `Day ${dom} of month at ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`;
    if (min === '*/1' || (min === '*' && hour === '*'))
      return 'Every minute';

    return expression;
  }

  private dowName(dow: string): string {
    const names: Record<string, string> = {
      '0': 'Sunday', '1': 'Monday', '2': 'Tuesday',
      '3': 'Wednesday', '4': 'Thursday', '5': 'Friday', '6': 'Saturday',
    };
    return names[dow] || `Day ${dow}`;
  }
}
