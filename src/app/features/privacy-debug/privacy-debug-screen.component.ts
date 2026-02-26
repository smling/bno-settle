import { Component, inject } from '@angular/core';
import { I18nService } from '../../i18n/i18n.service';
import { SectionCardComponent } from '../../shared/section-card/section-card.component';

@Component({
  selector: 'app-privacy-debug-screen',
  standalone: true,
  imports: [SectionCardComponent],
  template: `
    <app-section-card [title]="i18n.t('privacyDebug.title')" [subtitle]="i18n.t('privacyDebug.subtitle')">
      <p>{{ i18n.t('privacyDebug.csp') }}</p>
      <p>{{ i18n.t('privacyDebug.network') }}</p>
      <p>{{ i18n.t('privacyDebug.telemetry') }}</p>
    </app-section-card>
  `,
  styles: [
    `
      p {
        margin: 0 0 0.5rem;
        line-height: 1.35;
      }
    `
  ]
})
export class PrivacyDebugScreenComponent {
  protected readonly i18n = inject(I18nService);
}
