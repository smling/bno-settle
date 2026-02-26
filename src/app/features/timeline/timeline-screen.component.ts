import { Component, inject } from '@angular/core';
import { I18nService } from '../../i18n/i18n.service';
import { SectionCardComponent } from '../../shared/section-card/section-card.component';

@Component({
  selector: 'app-timeline-screen',
  standalone: true,
  imports: [SectionCardComponent],
  template: `
    <app-section-card [title]="i18n.t('timeline.title')" [subtitle]="i18n.t('timeline.subtitle')">
      <ol>
        @for (milestone of milestones; track milestone.labelKey) {
          <li>
            <strong>{{ i18n.t(milestone.labelKey) }}:</strong>
            {{ i18n.t(milestone.windowKey) }}
          </li>
        }
      </ol>
    </app-section-card>
  `,
  styles: [
    `
      ol {
        margin: 0;
        padding-left: 1.1rem;
      }

      li {
        margin-bottom: 0.4rem;
        line-height: 1.35;
      }
    `
  ]
})
export class TimelineScreenComponent {
  protected readonly i18n = inject(I18nService);

  protected readonly milestones = [
    {
      labelKey: 'timeline.milestone.residenceYear5.label',
      windowKey: 'timeline.milestone.residenceYear5.window'
    },
    {
      labelKey: 'timeline.milestone.ilrSubmission.label',
      windowKey: 'timeline.milestone.ilrSubmission.window'
    },
    {
      labelKey: 'timeline.milestone.citizenshipWindow.label',
      windowKey: 'timeline.milestone.citizenshipWindow.window'
    }
  ];
}
