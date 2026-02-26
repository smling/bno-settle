import { Component } from '@angular/core';
import { QuickCheckInput } from '../../models/spec.models';
import { SectionCardComponent } from '../../shared/section-card/section-card.component';
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge.component';
import { evaluateQuickCheck } from './quick-check-evaluator';

@Component({
  selector: 'app-quick-check-screen',
  standalone: true,
  imports: [SectionCardComponent, StatusBadgeComponent],
  template: `
    <app-section-card title="Quick Check" subtitle="ILR and citizenship readiness guidance (non-binding).">
      <div class="status-row">
        <strong>ILR:</strong>
        <app-status-badge [label]="assessment.ilr.status" />
      </div>
      @if (assessment.ilr.reasons.length > 0) {
        <ul>
          @for (reason of assessment.ilr.reasons; track reason) {
            <li>{{ reason }}</li>
          }
        </ul>
      }

      <div class="status-row">
        <strong>Citizenship:</strong>
        <app-status-badge [label]="assessment.citizenship.status" />
      </div>
      @if (assessment.citizenship.reasons.length > 0) {
        <ul>
          @for (reason of assessment.citizenship.reasons; track reason) {
            <li>{{ reason }}</li>
          }
        </ul>
      }

      @if (assessment.ilr.missingChecklist.length > 0) {
        <p class="hint">
          Missing checklist items: {{ assessment.ilr.missingChecklist.join(', ') }}
        </p>
      }
    </app-section-card>
  `,
  styles: [
    `
      .status-row {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        margin-top: 0.35rem;
      }

      ul {
        margin: 0.5rem 0 0.85rem;
        padding-left: 1.1rem;
      }

      .hint {
        margin: 0.2rem 0 0;
        color: #4f626b;
        font-size: 0.88rem;
      }
    `
  ]
})
export class QuickCheckScreenComponent {
  private readonly sampleInput: QuickCheckInput = {
    state: {
      monthsInUK: 59,
      ilrGranted: true,
      monthsSinceILR: 8,
      marriedToBritishCitizen: false,
      lifeInUkPassed: false,
      englishB1MetOrExempt: true
    },
    absence: {
      daysOutsideLast12Months: 88,
      maxDaysOutsideInAnyRolling12Months: 182,
      daysOutsideLast5YearsTotal: 410,
      rolling12MonthPeaks: [{ start: '2025-03-01', end: '2026-02-28', daysOutside: 182 }]
    },
    riskFlags: ['no', 'unsure']
  };

  protected readonly assessment = evaluateQuickCheck(this.sampleInput);
}
