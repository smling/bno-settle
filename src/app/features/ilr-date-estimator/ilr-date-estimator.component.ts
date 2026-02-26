import { Component, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { I18nService } from '../../i18n/i18n.service';
import { TravelTimingContext } from '../../models/travel-timing-context.model';
import { IlrDateCalculatorService, IlrTimelineEstimate } from '../../services/ilr-date-calculator.service';
import { IlrEstimateStateService } from '../../services/ilr-estimate-state.service';
import { DateInputComponent } from '../../shared/date-input/date-input.component';
import { SectionCardComponent } from '../../shared/section-card/section-card.component';

@Component({
  selector: 'app-ilr-date-estimator',
  standalone: true,
  imports: [FormsModule, SectionCardComponent, DateInputComponent, MatButtonModule],
  template: `
    <app-section-card
      [title]="i18n.t('ilrEstimator.title')"
      [subtitle]="i18n.t('ilrEstimator.subtitle')"
    >
      <form class="calculator-form" (ngSubmit)="calculate()">
        <app-date-input
          [label]="i18n.t('ilrEstimator.visaApprovedDateLabel')"
          [value]="visaApprovedDate"
          (valueChange)="visaApprovedDate = $event"
          [required]="true"
        />

        <button
          mat-flat-button
          color="primary"
          type="submit"
          class="emoji-btn"
          [attr.aria-label]="i18n.t('ilrEstimator.estimateButton')"
          [attr.title]="i18n.t('ilrEstimator.estimateButton')"
        >
          🧮
        </button>
      </form>

      @if (showError) {
        <p class="error">{{ i18n.t('ilrEstimator.error.invalidVisaApprovedDate') }}</p>
      }

      @if (estimate) {
        <div class="result-grid">
          <p>{{ i18n.t('ilrEstimator.result.visaApprovedDate', { date: estimate.visaApprovedDate }) }}</p>
          <p>{{ i18n.t('ilrEstimator.result.visaExpiryDate', { date: estimate.visaExpiryDate }) }}</p>
          <p>
            {{
              i18n.t('ilrEstimator.result.earliestIlrApplyDate', {
                date: estimate.earliestIlrApplyDate
              })
            }}
          </p>
        </div>
        <p class="assumption">
          {{ i18n.t('ilrEstimator.assumption') }}
        </p>
      }
    </app-section-card>
  `,
  styles: [
    `
      .calculator-form {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        align-items: center;
      }

      app-date-input {
        flex: 1 1 220px;
        min-width: 200px;
      }

      .emoji-btn {
        min-width: 2.5rem;
        width: 2.5rem;
        padding: 0;
        font-size: 1.2rem;
        line-height: 1;
      }

      .result-grid {
        margin-top: 0.3rem;
        display: grid;
        gap: 0.35rem;
      }

      .result-grid p {
        margin: 0;
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
export class IlrDateEstimatorComponent implements OnInit, OnChanges {
  protected readonly i18n = inject(I18nService);
  @Input() public travelTimingContext: TravelTimingContext | null = null;

  public visaApprovedDate = '';
  public estimate: IlrTimelineEstimate | null = null;
  public showError = false;

  constructor(
    private readonly ilrDateCalculatorService: IlrDateCalculatorService,
    private readonly ilrEstimateStateService: IlrEstimateStateService
  ) {}

  public ngOnInit(): void {
    this.syncFromState();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['travelTimingContext']) {
      this.syncFromState();
    }
  }

  public calculate(): void {
    this.estimate = this.ilrDateCalculatorService.estimateFromVisaApprovedDate(this.visaApprovedDate);
    this.showError = this.estimate === null;
    if (this.travelTimingContext) {
      this.travelTimingContext.visaApprovedDate.set(this.visaApprovedDate);
      this.travelTimingContext.estimate.set(this.estimate);
    }
    this.ilrEstimateStateService.setEstimate(this.visaApprovedDate, this.estimate);
  }

  private syncFromState(): void {
    if (this.travelTimingContext) {
      this.visaApprovedDate = this.travelTimingContext.visaApprovedDate();
      this.estimate = this.travelTimingContext.estimate();
      this.showError = this.visaApprovedDate !== '' && this.estimate === null;
      return;
    }
    if (this.visaApprovedDate === '' && this.estimate === null) {
      this.visaApprovedDate = this.ilrEstimateStateService.visaApprovedDate();
      this.estimate = this.ilrEstimateStateService.estimate();
    }
    this.showError = this.visaApprovedDate !== '' && this.estimate === null;
  }
}
