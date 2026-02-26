import { Component } from '@angular/core';
import { RiskAnswer } from '../../models/spec.models';
import { SectionCardComponent } from '../../shared/section-card/section-card.component';

interface RiskFlagItem {
  code: string;
  prompt: string;
  answer: RiskAnswer;
}

@Component({
  selector: 'app-risk-flags-screen',
  standalone: true,
  imports: [SectionCardComponent],
  template: `
    <app-section-card title="Risk Flags" subtitle="Yes / no / unsure prompts to highlight review cases.">
      <ul>
        @for (item of items; track item.code) {
          <li>
            <span>{{ item.prompt }}</span>
            <strong [attr.data-answer]="item.answer">{{ item.answer }}</strong>
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
  protected readonly items: RiskFlagItem[] = [
    { code: 'overstay', prompt: 'Any history of overstay or immigration breach?', answer: 'no' },
    { code: 'conviction', prompt: 'Any criminal conviction to disclose?', answer: 'unsure' },
    { code: 'misrep', prompt: 'Any previous refusal or discrepancy concerns?', answer: 'no' }
  ];
}
