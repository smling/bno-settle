import { Component, inject } from '@angular/core';
import { I18nService } from '../../i18n/i18n.service';
import { SectionCardComponent } from '../../shared/section-card/section-card.component';

@Component({
  selector: 'app-onboarding-screen',
  standalone: true,
  imports: [SectionCardComponent],
  template: `
    <app-section-card
      [title]="i18n.t('onboarding.title')"
      [subtitle]="i18n.t('onboarding.subtitle')"
    >
      <ul>
        <li>{{ i18n.t('onboarding.item.noAccount') }}</li>
        <li>{{ i18n.t('onboarding.item.localData') }}</li>
        <li>{{ i18n.t('onboarding.item.guidance') }}</li>
      </ul>
    </app-section-card>
  `,
  styles: [
    `
      ul {
        margin: 0;
        padding-left: 1.1rem;
      }

      li {
        margin-bottom: 0.3rem;
        line-height: 1.35;
      }
    `
  ]
})
export class OnboardingScreenComponent {
  protected readonly i18n = inject(I18nService);
}
