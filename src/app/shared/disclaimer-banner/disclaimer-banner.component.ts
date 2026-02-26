import { Component, inject } from '@angular/core';
import { I18nService } from '../../i18n/i18n.service';

@Component({
  selector: 'app-disclaimer-banner',
  standalone: true,
  template: `
    <aside class="disclaimer" [attr.aria-label]="i18n.t('disclaimer.aria')">
      <strong>{{ i18n.t('disclaimer.title') }}</strong>
      <span>{{ i18n.t('disclaimer.body') }}</span>
    </aside>
  `,
  styles: [
    `
      .disclaimer {
        margin: 0 0 1rem;
        border: 1px solid #bcced9;
        background: #f7fbff;
        border-radius: 10px;
        padding: 0.7rem 0.85rem;
        display: grid;
        gap: 0.15rem;
        color: #304148;
        line-height: 1.35;
      }

      .disclaimer strong {
        font-size: 0.93rem;
      }

      .disclaimer span {
        font-size: 0.86rem;
      }
    `
  ]
})
export class DisclaimerBannerComponent {
  protected readonly i18n = inject(I18nService);
}
