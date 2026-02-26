import { Component, inject } from '@angular/core';
import { I18nService } from '../../i18n/i18n.service';
import { RiskAnswer } from '../../models/spec.models';
import { SectionCardComponent } from '../../shared/section-card/section-card.component';

interface RiskFlagItem {
  code: string;
  promptKey: string;
  answer: RiskAnswer;
}

@Component({
  selector: 'app-risk-flags-screen',
  standalone: true,
  imports: [SectionCardComponent],
  template: `
    <app-section-card [title]="i18n.t('riskFlags.title')" [subtitle]="i18n.t('riskFlags.subtitle')">
      <ul>
        @for (item of items; track item.code) {
          <li>
            <span>{{ i18n.t(item.promptKey) }}</span>
            <strong [attr.data-answer]="item.answer">{{ i18n.t(answerLabelKey(item.answer)) }}</strong>
          </li>
        }
      </ul>
    </app-section-card>
  `,
  styles: [
    `
      ul {
        margin: 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 0.55rem;
      }

      li {
        border: 1px solid #d7e3ea;
        border-radius: 8px;
        display: flex;
        justify-content: space-between;
        gap: 0.7rem;
        padding: 0.4rem 0.55rem;
        align-items: center;
      }

      strong {
        text-transform: uppercase;
        font-size: 0.76rem;
      }

      [data-answer='yes'],
      [data-answer='unsure'] {
        color: #8a260f;
      }

      [data-answer='no'] {
        color: #1b5f3d;
      }
    `
  ]
})
export class RiskFlagsScreenComponent {
  protected readonly i18n = inject(I18nService);

  protected readonly items: RiskFlagItem[] = [
    { code: 'overstay', promptKey: 'riskFlags.item.overstay', answer: 'no' },
    { code: 'conviction', promptKey: 'riskFlags.item.conviction', answer: 'unsure' },
    { code: 'misrep', promptKey: 'riskFlags.item.misrep', answer: 'no' }
  ];

  protected answerLabelKey(answer: RiskAnswer): string {
    return `riskAnswer.${answer}`;
  }
}
