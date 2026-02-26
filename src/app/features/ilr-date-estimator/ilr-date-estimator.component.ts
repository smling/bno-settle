import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
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
      title="ILR Date Estimator"
      subtitle="Enter your visa approved date to estimate visa expiry and earliest ILR date."
    >
      <form class="calculator-form" (ngSubmit)="calculate()">
        <app-date-input
          label="Visa approved date"
          [value]="visaApprovedDate"
          (valueChange)="visaApprovedDate = $event"
          [required]="true"
        />

        <button
          mat-flat-button
          color="primary"
          type="submit"
          class="emoji-btn"
          aria-label="Estimate ILR date"
          title="Estimate ILR date"
        >
          🧮
        </button>
      </form>

      @if (showError) {
        <p class="error">Enter a valid visa approved date.</p>
      }

      @if (estimate) {
        <div class="result-grid">
          <p><strong>Visa approved date:</strong> {{ estimate.visaApprovedDate }}</p>
          <p><strong>Visa expiry date:</strong> {{ estimate.visaExpiryDate }}</p>
          <p><strong>Earliest ILR apply date:</strong> {{ estimate.earliestIlrApplyDate }}</p>
        </div>
        <p class="assumption">
          Assumption: 5-year visa duration and ILR submission up to 28 days before expiry.
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
export class IlrDateEstimatorComponent {
  public visaApprovedDate = '';
  public estimate: IlrTimelineEstimate | null = null;
  public showError = false;

  constructor(
    private readonly ilrDateCalculatorService: IlrDateCalculatorService,
    private readonly ilrEstimateStateService: IlrEstimateStateService
  ) {
    this.visaApprovedDate = this.ilrEstimateStateService.visaApprovedDate();
    this.estimate = this.ilrEstimateStateService.estimate();
    this.showError = this.visaApprovedDate !== '' && this.estimate === null;
  }

  public calculate(): void {
    this.estimate = this.ilrDateCalculatorService.estimateFromVisaApprovedDate(this.visaApprovedDate);
    this.showError = this.estimate === null;
    this.ilrEstimateStateService.setEstimate(this.visaApprovedDate, this.estimate);
  }
}
