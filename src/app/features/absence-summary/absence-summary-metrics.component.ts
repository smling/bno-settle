import { Component, Input } from '@angular/core';
import { ComputedAbsenceSummary } from '../../models/spec.models';

@Component({
  selector: 'app-absence-summary-metrics',
  standalone: true,
  template: `
    <div class="metrics">
      <p>
        <strong>Last 12 months:</strong>
        {{ summary.daysOutsideLast12Months }} days outside UK
      </p>
      <p>
        <strong>Max rolling 12 months:</strong>
        {{ summary.maxDaysOutsideInAnyRolling12Months }} days
      </p>
      <p>
        <strong>Last 5 years:</strong>
        {{ summary.daysOutsideLast5YearsTotal }} days
      </p>
    </div>
  `,
  styles: [
    `
      .metrics {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }

      p {
        margin: 0;
        border: 1px solid #d3e1ea;
        border-radius: 10px;
        padding: 0.55rem 0.65rem;
        background: #f9fbff;
        line-height: 1.3;
      }
    `
  ]
})
export class AbsenceSummaryMetricsComponent {
  @Input({ required: true }) summary!: ComputedAbsenceSummary;
}
