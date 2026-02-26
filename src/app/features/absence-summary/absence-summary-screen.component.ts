import { Component, effect } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { ComputedAbsenceSummary, TravelRecord } from '../../models/spec.models';
import { IlrEstimateStateService } from '../../services/ilr-estimate-state.service';
import { SectionCardComponent } from '../../shared/section-card/section-card.component';
import { AbsenceSummaryMetricsComponent } from './absence-summary-metrics.component';
import { RollingPeaksChartComponent } from './rolling-peaks-chart.component';
import { SEED_TRAVEL_RECORDS } from '../travel-log/travel-log-seed-records';

interface YearlyAbsenceRow {
  year: number;
  daysOutside: number;
  tripSegments: number;
}

interface DateRange {
  start: Date;
  end: Date;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

@Component({
  selector: 'app-absence-summary-screen',
  standalone: true,
  imports: [
    SectionCardComponent,
    AbsenceSummaryMetricsComponent,
    RollingPeaksChartComponent,
    MatExpansionModule
  ],
  template: `
    <app-section-card title="Absence Summary" subtitle="Derived totals and rolling window peaks.">
      @if (showMissingEstimate) {
        <p class="hint">Calculate ILR dates first. This summary uses visa approved date and visa expiry date.</p>
      } @else {
        <p class="hint">
          Using travel log records from {{ visaApprovedDate }} to {{ visaExpiryDate }}.
        </p>
        <app-absence-summary-metrics [summary]="summary" />
        <app-rolling-peaks-chart [yearlyData]="yearlyBreakdown" />

        <mat-accordion>
          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title>Rolling peak details</mat-panel-title>
            </mat-expansion-panel-header>
            <ul>
              @for (peak of summary.rolling12MonthPeaks; track peak.start + peak.end) {
                <li>{{ peak.start }} to {{ peak.end }}: {{ peak.daysOutside }} days outside</li>
              } @empty {
                <li>No rolling-peak windows found in this period.</li>
              }
            </ul>
          </mat-expansion-panel>

          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title>Yearly summary (visa period)</mat-panel-title>
            </mat-expansion-panel-header>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Days outside UK</th>
                    <th>Trip segments</th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of yearlyBreakdown; track row.year) {
                    <tr>
                      <td>{{ row.year }}</td>
                      <td>{{ row.daysOutside }}</td>
                      <td>{{ row.tripSegments }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </mat-expansion-panel>

          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title>Country summary (last 12 months before visa expiry)</mat-panel-title>
            </mat-expansion-panel-header>
            <ul>
              @for (country of countryTotalsLast12Months; track country.code) {
                <li>{{ country.code }}: {{ country.days }} days</li>
              } @empty {
                <li>No absences in the last 12 months.</li>
              }
            </ul>
          </mat-expansion-panel>
        </mat-accordion>
      }
    </app-section-card>
  `,
  styles: [
    `
      .hint {
        margin: 0.1rem 0 0.45rem;
        color: #4f626b;
        font-size: 0.86rem;
      }

      ul {
        margin: 0.2rem 0 0;
        padding-left: 1.1rem;
      }

      .table-wrap {
        overflow-x: auto;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        min-width: 320px;
      }

      th,
      td {
        text-align: left;
        border-bottom: 1px solid #d7e3ea;
        padding: 0.35rem 0.25rem;
      }
    `
  ]
})
export class AbsenceSummaryScreenComponent {
  protected readonly records: TravelRecord[] = SEED_TRAVEL_RECORDS.map((record) => ({ ...record }));
  protected visaApprovedDate = '';
  protected visaExpiryDate = '';
  protected summary: ComputedAbsenceSummary = this.createEmptySummary();
  protected yearlyBreakdown: YearlyAbsenceRow[] = [];
  protected countryTotalsLast12Months: Array<{ code: string; days: number }> = [];
  protected showMissingEstimate = true;

  constructor(private readonly ilrEstimateStateService: IlrEstimateStateService) {
    effect(() => {
      const estimate = this.ilrEstimateStateService.estimate();
      if (!estimate) {
        this.summary = this.createEmptySummary();
        this.yearlyBreakdown = [];
        this.countryTotalsLast12Months = [];
        this.visaApprovedDate = '';
        this.visaExpiryDate = '';
        this.showMissingEstimate = true;
        return;
      }
      this.calculateSummaryForRange(estimate.visaApprovedDate, estimate.visaExpiryDate);
    });
  }

  private calculateSummaryForRange(rangeStartIso: string, rangeEndIso: string): void {
    const rangeStart = this.parseIsoDate(rangeStartIso);
    const rangeEnd = this.parseIsoDate(rangeEndIso);
    if (!rangeStart || !rangeEnd || rangeStart.getTime() > rangeEnd.getTime()) {
      this.summary = this.createEmptySummary();
      this.yearlyBreakdown = [];
      this.countryTotalsLast12Months = [];
      this.visaApprovedDate = '';
      this.visaExpiryDate = '';
      this.showMissingEstimate = true;
      return;
    }

    const last12MonthsStart = this.addDaysUtc(rangeEnd, -364);
    const byCountryLast12Months = this.countDaysByCountry(
      this.records,
      last12MonthsStart,
      rangeEnd
    );
    const daysOutsideLast12Months = this.sumByCountry(byCountryLast12Months);
    const daysOutsideLast5YearsTotal = this.countDaysOutside(this.records, rangeStart, rangeEnd);
    const rollingPeaks = this.computeRolling12MonthPeaks(this.records, rangeStart, rangeEnd);

    this.summary = {
      daysOutsideLast12Months,
      maxDaysOutsideInAnyRolling12Months: rollingPeaks.maxDaysOutside,
      daysOutsideLast5YearsTotal,
      rolling12MonthPeaks: rollingPeaks.windows,
      byCountryLast12Months: Object.fromEntries(byCountryLast12Months)
    };
    this.yearlyBreakdown = this.groupByYear(this.records, rangeStart, rangeEnd);
    this.countryTotalsLast12Months = Array.from(byCountryLast12Months.entries())
      .map(([code, days]) => ({ code, days }))
      .sort((a, b) => b.days - a.days || a.code.localeCompare(b.code));
    this.visaApprovedDate = rangeStartIso;
    this.visaExpiryDate = rangeEndIso;
    this.showMissingEstimate = false;
  }

  private createEmptySummary(): ComputedAbsenceSummary {
    return {
      daysOutsideLast12Months: 0,
      maxDaysOutsideInAnyRolling12Months: 0,
      daysOutsideLast5YearsTotal: 0,
      rolling12MonthPeaks: [],
      byCountryLast12Months: {}
    };
  }

  private groupByYear(records: TravelRecord[], rangeStart: Date, rangeEnd: Date): YearlyAbsenceRow[] {
    const yearly = new Map<number, YearlyAbsenceRow>();
    for (let year = rangeStart.getUTCFullYear(); year <= rangeEnd.getUTCFullYear(); year += 1) {
      yearly.set(year, { year, daysOutside: 0, tripSegments: 0 });
    }

    for (const record of records) {
      const recordRange = this.toDateRange(record);
      if (!recordRange) {
        continue;
      }
      const overlap = this.getOverlap(recordRange.start, recordRange.end, rangeStart, rangeEnd);
      if (!overlap) {
        continue;
      }

      for (let year = overlap.start.getUTCFullYear(); year <= overlap.end.getUTCFullYear(); year += 1) {
        const yearStart = new Date(Date.UTC(year, 0, 1));
        const yearEnd = new Date(Date.UTC(year, 11, 31));
        const yearOverlap = this.getOverlap(overlap.start, overlap.end, yearStart, yearEnd);
        if (!yearOverlap) {
          continue;
        }
        const row = yearly.get(year);
        if (!row) {
          continue;
        }
        row.daysOutside += this.daysInclusive(yearOverlap.start, yearOverlap.end);
        row.tripSegments += 1;
      }
    }

    return Array.from(yearly.values()).sort((a, b) => b.year - a.year);
  }

  private countDaysOutside(records: TravelRecord[], rangeStart: Date, rangeEnd: Date): number {
    let total = 0;
    for (const record of records) {
      const recordRange = this.toDateRange(record);
      if (!recordRange) {
        continue;
      }
      const overlap = this.getOverlap(recordRange.start, recordRange.end, rangeStart, rangeEnd);
      if (!overlap) {
        continue;
      }
      total += this.daysInclusive(overlap.start, overlap.end);
    }
    return total;
  }

  private countDaysByCountry(
    records: TravelRecord[],
    rangeStart: Date,
    rangeEnd: Date
  ): Map<string, number> {
    const byCountry = new Map<string, number>();
    for (const record of records) {
      const recordRange = this.toDateRange(record);
      if (!recordRange) {
        continue;
      }
      const overlap = this.getOverlap(recordRange.start, recordRange.end, rangeStart, rangeEnd);
      if (!overlap) {
        continue;
      }
      const current = byCountry.get(record.destinationCountryCode) ?? 0;
      byCountry.set(
        record.destinationCountryCode,
        current + this.daysInclusive(overlap.start, overlap.end)
      );
    }
    return byCountry;
  }

  private computeRolling12MonthPeaks(
    records: TravelRecord[],
    analysisStart: Date,
    analysisEnd: Date
  ): {
    maxDaysOutside: number;
    windows: ComputedAbsenceSummary['rolling12MonthPeaks'];
  } {
    const latestWindowStart = this.addDaysUtc(analysisEnd, -364);
    if (latestWindowStart.getTime() < analysisStart.getTime()) {
      return { maxDaysOutside: 0, windows: [] };
    }

    const windows: Array<{ start: Date; end: Date; daysOutside: number }> = [];
    for (
      let cursor = new Date(analysisStart.getTime());
      cursor.getTime() <= latestWindowStart.getTime();
      cursor = this.addDaysUtc(cursor, 1)
    ) {
      const windowEnd = this.addDaysUtc(cursor, 364);
      windows.push({
        start: cursor,
        end: windowEnd,
        daysOutside: this.countDaysOutside(records, cursor, windowEnd)
      });
    }

    const maxDaysOutside = windows.reduce(
      (maxDays, window) => Math.max(maxDays, window.daysOutside),
      0
    );

    const peakWindows = windows
      .filter((window) => window.daysOutside === maxDaysOutside && maxDaysOutside > 0)
      .slice(0, 8)
      .map((window) => ({
        start: this.toIsoDate(window.start),
        end: this.toIsoDate(window.end),
        daysOutside: window.daysOutside
      }));

    return { maxDaysOutside, windows: peakWindows };
  }

  private toDateRange(record: TravelRecord): DateRange | null {
    const start = this.parseIsoDate(record.departDate);
    const end = this.parseIsoDate(record.returnDate);
    if (!start || !end || start.getTime() > end.getTime()) {
      return null;
    }
    return { start, end };
  }

  private getOverlap(
    leftStart: Date,
    leftEnd: Date,
    rightStart: Date,
    rightEnd: Date
  ): DateRange | null {
    const start = leftStart.getTime() >= rightStart.getTime() ? leftStart : rightStart;
    const end = leftEnd.getTime() <= rightEnd.getTime() ? leftEnd : rightEnd;
    if (start.getTime() > end.getTime()) {
      return null;
    }
    return { start, end };
  }

  private sumByCountry(byCountry: Map<string, number>): number {
    let total = 0;
    for (const days of byCountry.values()) {
      total += days;
    }
    return total;
  }

  private parseIsoDate(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
      return null;
    }
    const [, yearText, monthText, dayText] = match;
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    if (
      parsed.getUTCFullYear() !== year ||
      parsed.getUTCMonth() !== month - 1 ||
      parsed.getUTCDate() !== day
    ) {
      return null;
    }
    return parsed;
  }

  private toIsoDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private addDaysUtc(date: Date, days: number): Date {
    const result = new Date(date.getTime());
    result.setUTCDate(result.getUTCDate() + days);
    return result;
  }

  private daysInclusive(start: Date, end: Date): number {
    return Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
  }
}
