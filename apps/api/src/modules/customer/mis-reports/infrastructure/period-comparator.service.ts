import { Injectable } from '@nestjs/common';
import { ReportMetric } from '../interfaces/report.interface';

/** Previous period date range */
export interface ComparisonPeriod {
  from: Date;
  to: Date;
}

/**
 * Service for computing period-over-period comparisons.
 * Given a current date range, calculates the equivalent previous period
 * and compares metric values to produce change percentages and directions.
 */
@Injectable()
export class PeriodComparatorService {
  /**
   * Calculate the previous period date range of equal duration.
   * For example, if the current period is Jan 1-31 (31 days),
   * the previous period will be Dec 1-31 (31 days before Jan 1).
   * @param dateFrom - Start of the current period
   * @param dateTo - End of the current period
   * @returns Previous period start and end dates
   */
  getComparisonPeriod(dateFrom: Date, dateTo: Date): ComparisonPeriod {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    const durationMs = to.getTime() - from.getTime();
    const prevTo = new Date(from.getTime() - 1);
    const prevFrom = new Date(prevTo.getTime() - durationMs);

    return { from: prevFrom, to: prevTo };
  }

  /**
   * Compare current metrics against previous-period metrics.
   * Matches metrics by key, calculates percentage change and direction.
   * Returns a new array of ReportMetric with previousValue, changePercent,
   * and changeDirection populated.
   * @param current - Current period metrics
   * @param previous - Previous period metrics
   * @returns Merged metrics array with comparison data
   */
  compare(current: ReportMetric[], previous: ReportMetric[]): ReportMetric[] {
    const previousMap = new Map<string, ReportMetric>();
    for (const metric of previous) {
      previousMap.set(metric.key, metric);
    }

    return current.map(metric => {
      const prev = previousMap.get(metric.key);
      if (!prev) {
        return {
          ...metric,
          previousValue: 0,
          changePercent: metric.value > 0 ? 100 : 0,
          changeDirection: metric.value > 0 ? 'UP' as const : 'FLAT' as const,
        };
      }

      const changePercent = this.calculateChangePercent(metric.value, prev.value);
      const changeDirection = this.getDirection(metric.value, prev.value);

      return {
        ...metric,
        previousValue: prev.value,
        changePercent,
        changeDirection,
      };
    });
  }

  /**
   * Calculate percentage change between two values.
   * Returns 0 when previous value is 0 to avoid division by zero
   * (except when current > 0, which returns 100%).
   * @param current - Current period value
   * @param previous - Previous period value
   * @returns Percentage change rounded to one decimal place
   */
  private calculateChangePercent(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;
  }

  /**
   * Determine the direction of change between two values.
   * Uses a small epsilon threshold to handle floating-point equality.
   * @param current - Current period value
   * @param previous - Previous period value
   * @returns 'UP', 'DOWN', or 'FLAT'
   */
  private getDirection(current: number, previous: number): 'UP' | 'DOWN' | 'FLAT' {
    const diff = current - previous;
    if (Math.abs(diff) < 0.001) return 'FLAT';
    return diff > 0 ? 'UP' : 'DOWN';
  }
}
