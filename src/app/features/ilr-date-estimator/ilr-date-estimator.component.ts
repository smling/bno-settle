import { Component, Input, OnInit, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { I18nService } from '../../i18n/i18n.service';
import { TravelTimingContext } from '../../models/travel-timing-context.model';
import { TravelRecord } from '../../models/spec.models';
import { IlrDateCalculatorService, IlrTimelineEstimate } from '../../services/ilr-date-calculator.service';
import { IlrEstimateStateService } from '../../services/ilr-estimate-state.service';
import { TravelLogStateService } from '../../services/travel-log-state.service';
import { DateInputComponent } from '../../shared/date-input/date-input.component';
import { SectionCardComponent } from '../../shared/section-card/section-card.component';

const PRE_ARRIVAL_RECORD_ID = 'trip_pre_arrival_outside_uk';

@Component({
  selector: 'app-ilr-date-estimator',
  standalone: true,
  imports: [FormsModule, SectionCardComponent, DateInputComponent, MatButtonModule, MatGridListModule],
  template: `
    <app-section-card
      [title]="i18n.t('ilrEstimator.title')"
      [subtitle]="i18n.t('ilrEstimator.subtitle')"
    >
      <form class="editor" (ngSubmit)="calculate()">
        <mat-grid-list cols="1" rowHeight="7rem" gutterSize="10px" class="form-grid">
          <mat-grid-tile>
            <app-date-input
              [label]="i18n.t('ilrEstimator.visaApprovedDateLabel')"
              [value]="visaApprovedDate"
              (valueChange)="onVisaApprovedDateChange($event)"
              [required]="true"
            />
          </mat-grid-tile>
          <mat-grid-tile>
            <app-date-input
              [label]="i18n.t('ilrEstimator.arrivedUkDateLabel')"
              [value]="arrivedUkDate"
              (valueChange)="onArrivedUkDateChange($event)"
              [required]="true"
            />
          </mat-grid-tile>
        </mat-grid-list>

        <div class="actions">
          <button
            mat-flat-button
            type="submit"
            class="emoji-btn estimate-btn"
            [attr.aria-label]="i18n.t('ilrEstimator.estimateButton')"
            [attr.title]="i18n.t('ilrEstimator.estimateButton')"
          >
            🧮
          </button>
        </div>
      </form>

      @if (showError) {
        <p class="error">{{ i18n.t('ilrEstimator.error.invalidVisaApprovedDate') }}</p>
      }

      @if (estimate) {
        <div class="table-wrap">
          <table class="value-table">
            <thead>
              <tr>
                <th>{{ i18n.t('ilrEstimator.table.item') }}</th>
                <th>{{ i18n.t('ilrEstimator.table.value') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{ i18n.t('ilrEstimator.table.visaApprovedDate') }}</td>
                <td>{{ estimate.visaApprovedDate }}</td>
              </tr>
              <tr>
                <td>{{ i18n.t('ilrEstimator.table.visaExpiryDate') }}</td>
                <td>{{ estimate.visaExpiryDate }}</td>
              </tr>
              <tr>
                <td>{{ i18n.t('ilrEstimator.table.arrivedUkDate') }}</td>
                <td>{{ arrivedUkDate || '-' }}</td>
              </tr>
              <tr>
                <td>{{ i18n.t('ilrEstimator.table.earliestIlrApplyDate') }}</td>
                <td>{{ estimate.earliestIlrApplyDate }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="assumption">
          {{ i18n.t('ilrEstimator.assumption') }}
        </p>
      }
    </app-section-card>
  `,
  styles: [
    `
      .editor {
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
        margin-bottom: 0.8rem;
      }

      .form-grid {
        width: 100%;
      }

      .form-grid app-date-input {
        width: 100%;
      }

      .actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }

      .emoji-btn {
        min-width: 2.5rem;
        width: 2.5rem;
        padding: 0;
        font-size: 1.2rem;
        line-height: 1;
      }

      .estimate-btn {
        background: #e7f6ea;
        color: #235939;
      }

      .table-wrap {
        margin-top: 0.3rem;
        overflow-x: auto;
      }

      table {
        width: 100%;
        min-width: 320px;
        border-collapse: collapse;
      }

      th,
      td {
        text-align: left;
        border-bottom: 1px solid #d7e3ea;
        padding: 0.35rem 0.25rem;
      }

      .error {
        margin: 0.15rem 0 0;
        color: #8a260f;
      }

      .assumption {
        margin: 0.45rem 0 0;
        color: #4f626b;
        font-size: 0.86rem;
      }
    `
  ]
})
export class IlrDateEstimatorComponent implements OnInit {
  protected readonly i18n = inject(I18nService);
  private readonly travelTimingContextState = signal<TravelTimingContext | null>(null);
  @Input() public set travelTimingContext(value: TravelTimingContext | null) {
    this.travelTimingContextState.set(value);
  }

  public get travelTimingContext(): TravelTimingContext | null {
    return this.travelTimingContextState();
  }

  public visaApprovedDate = '';
  public arrivedUkDate = '';
  public estimate: IlrTimelineEstimate | null = null;
  public showError = false;

  constructor(
    private readonly ilrDateCalculatorService: IlrDateCalculatorService,
    private readonly ilrEstimateStateService: IlrEstimateStateService,
    private readonly travelLogStateService: TravelLogStateService
  ) {
    effect(() => {
      const context = this.travelTimingContextState();
      if (!context) {
        return;
      }
      this.visaApprovedDate = context.visaApprovedDate();
      this.arrivedUkDate = context.arrivedUkDate();
      this.estimate = context.estimate();
      this.showError = this.visaApprovedDate !== '' && this.estimate === null;
    });
  }

  public ngOnInit(): void {
    this.syncFromState();
  }

  public calculate(): void {
    this.estimate = this.ilrDateCalculatorService.estimateFromVisaApprovedDate(this.visaApprovedDate);
    if (this.estimate) {
      this.estimate = {
        ...this.estimate,
        ...(this.arrivedUkDate ? { arrivedUkDate: this.arrivedUkDate } : {})
      };
    }
    this.showError = this.estimate === null;
    if (this.travelTimingContext) {
      this.travelTimingContext.visaApprovedDate.set(this.visaApprovedDate);
      this.travelTimingContext.arrivedUkDate.set(this.arrivedUkDate);
      this.travelTimingContext.estimate.set(this.estimate);
    }
    this.ilrEstimateStateService.setArrivedUkDate(this.arrivedUkDate);
    this.ilrEstimateStateService.setEstimate(this.visaApprovedDate, this.estimate);
    this.syncPreArrivalRecord();
  }

  protected onVisaApprovedDateChange(value: string): void {
    this.visaApprovedDate = value;
    const nextEstimate =
      this.estimate !== null && this.estimate.visaApprovedDate === value ? this.estimate : null;
    this.estimate = nextEstimate;
    this.showError = false;
    if (this.travelTimingContext) {
      this.travelTimingContext.visaApprovedDate.set(value);
      this.travelTimingContext.arrivedUkDate.set(this.arrivedUkDate);
      this.travelTimingContext.estimate.set(nextEstimate);
    }
    this.ilrEstimateStateService.setArrivedUkDate(this.arrivedUkDate);
    this.ilrEstimateStateService.setEstimate(value, nextEstimate);
    this.syncPreArrivalRecord();
  }

  protected onArrivedUkDateChange(value: string): void {
    this.arrivedUkDate = value;
    if (this.travelTimingContext) {
      this.travelTimingContext.arrivedUkDate.set(value);
    }
    this.ilrEstimateStateService.setArrivedUkDate(value);
    this.syncPreArrivalRecord();
  }

  private syncFromState(): void {
    if (this.travelTimingContext) {
      this.visaApprovedDate = this.travelTimingContext.visaApprovedDate();
      this.arrivedUkDate = this.travelTimingContext.arrivedUkDate();
      this.estimate = this.travelTimingContext.estimate();
      this.showError = this.visaApprovedDate !== '' && this.estimate === null;
      this.syncPreArrivalRecord();
      return;
    }
    if (this.visaApprovedDate === '' && this.estimate === null) {
      this.visaApprovedDate = this.ilrEstimateStateService.visaApprovedDate();
      this.arrivedUkDate = this.ilrEstimateStateService.arrivedUkDate();
      this.estimate = this.ilrEstimateStateService.estimate();
    }
    this.showError = this.visaApprovedDate !== '' && this.estimate === null;
    this.syncPreArrivalRecord();
  }

  private syncPreArrivalRecord(): void {
    const range = this.resolvePreArrivalRange();
    if (!range) {
      this.removePreArrivalRecord();
      return;
    }

    const now = new Date().toISOString();
    const existing = this.currentRecords().find((record) => record.id === PRE_ARRIVAL_RECORD_ID);
    const record: TravelRecord = {
      id: PRE_ARRIVAL_RECORD_ID,
      departDate: range.departDate,
      returnDate: range.returnDate,
      destinationCountryCode: 'ZZ',
      tag: 'other',
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    };

    if (existing) {
      this.updatePreArrivalRecord(record);
      return;
    }
    this.addPreArrivalRecord(record);
  }

  private currentRecords(): TravelRecord[] {
    if (this.travelTimingContext) {
      return this.travelTimingContext.records();
    }
    return this.travelLogStateService.records();
  }

  private addPreArrivalRecord(record: TravelRecord): void {
    if (this.travelTimingContext) {
      this.travelTimingContext.records.update((records) => [record, ...records]);
      return;
    }
    this.travelLogStateService.addRecord(record);
  }

  private updatePreArrivalRecord(record: TravelRecord): void {
    if (this.travelTimingContext) {
      this.travelTimingContext.records.update((records) =>
        records.map((current) => (current.id === PRE_ARRIVAL_RECORD_ID ? record : current))
      );
      return;
    }
    this.travelLogStateService.updateRecord(PRE_ARRIVAL_RECORD_ID, {
      departDate: record.departDate,
      returnDate: record.returnDate,
      destinationCountryCode: record.destinationCountryCode,
      tag: record.tag,
      updatedAt: record.updatedAt
    });
  }

  private removePreArrivalRecord(): void {
    if (this.travelTimingContext) {
      this.travelTimingContext.records.update((records) =>
        records.filter((record) => record.id !== PRE_ARRIVAL_RECORD_ID)
      );
      return;
    }
    this.travelLogStateService.removeRecord(PRE_ARRIVAL_RECORD_ID);
  }

  private resolvePreArrivalRange(): { departDate: string; returnDate: string } | null {
    const visaApproved = this.parseIsoDate(this.visaApprovedDate);
    const arrivedUk = this.parseIsoDate(this.arrivedUkDate);
    if (!visaApproved || !arrivedUk) {
      return null;
    }
    const returnDate = this.addDays(arrivedUk, -1);
    if (returnDate.getTime() < visaApproved.getTime()) {
      return null;
    }
    return {
      departDate: this.toIsoDate(visaApproved),
      returnDate: this.toIsoDate(returnDate)
    };
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

  private addDays(date: Date, days: number): Date {
    const result = new Date(date.getTime());
    result.setUTCDate(result.getUTCDate() + days);
    return result;
  }

  private toIsoDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
