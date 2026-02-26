import { Component, Input, inject } from '@angular/core';
import { I18nService } from '../../i18n/i18n.service';
import { ComputedAbsenceSummary } from '../../models/spec.models';

@Component({
  selector: 'app-absence-summary-metrics',
  standalone: true,
  template: `
    <div class="metrics">
      <p>
        {{ i18n.t('absenceMetrics.last12Months', { days: summary.daysOutsideLast12Months }) }}
      </p>
      <p>
        {{ i18n.t('absenceMetrics.maxRolling12Months', { days: summary.maxDaysOutsideInAnyRolling12Months }) }}
      </p>
      <p>
        {{ i18n.t('absenceMetrics.last5Years', { days: summary.daysOutsideLast5YearsTotal }) }}
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
  protected readonly i18n = inject(I18nService);
  @Input({ required: true }) summary!: ComputedAbsenceSummary;
}
