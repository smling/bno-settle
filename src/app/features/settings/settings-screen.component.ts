import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { AppLanguage } from '../../i18n/translations';
import { I18nService } from '../../i18n/i18n.service';
import { SectionCardComponent } from '../../shared/section-card/section-card.component';

@Component({
  selector: 'app-settings-screen',
  standalone: true,
  imports: [SectionCardComponent, MatButtonModule, MatButtonToggleModule],
  template: `
    <app-section-card [title]="i18n.t('settings.title')" [subtitle]="i18n.t('settings.subtitle')">
      <div class="language-block">
        <p class="section-title">{{ i18n.t('settings.language.title') }}</p>
        <p class="hint">
          {{ i18n.t('settings.language.detected', { language: i18n.t(languageNameKey(i18n.systemLanguage())) }) }}
        </p>
        <p class="hint">
          {{
            i18n.hasOverride()
              ? i18n.t('settings.language.override')
              : i18n.t('settings.language.auto')
          }}
        </p>
        <div class="language-actions">
          <mat-button-toggle-group
            [value]="i18n.currentLanguage()"
            (change)="onLanguageChange($event)"
            aria-label="Language selector"
          >
            <mat-button-toggle value="zh-Hant">{{ i18n.t('language.name.zhHant') }}</mat-button-toggle>
            <mat-button-toggle value="en">{{ i18n.t('language.name.en') }}</mat-button-toggle>
          </mat-button-toggle-group>
          <button
            mat-stroked-button
            type="button"
            (click)="useSystemLanguage()"
            [disabled]="!i18n.hasOverride()"
          >
            {{ i18n.t('settings.language.followSystem') }}
          </button>
        </div>
      </div>
      <ul>
        <li>{{ i18n.t('settings.item.travelLogEnabled') }}</li>
        <li>{{ i18n.t('settings.item.vaultLockState') }}</li>
        <li>{{ i18n.t('settings.item.retentionPolicy') }}</li>
      </ul>
      <div class="actions">
        <button mat-stroked-button type="button">{{ i18n.t('settings.action.passphrase') }}</button>
        <button mat-stroked-button type="button">{{ i18n.t('settings.action.exportJson') }}</button>
        <button mat-stroked-button type="button">{{ i18n.t('settings.action.clearData') }}</button>
      </div>
    </app-section-card>
  `,
  styles: [
    `
      .language-block {
        margin-bottom: 0.8rem;
      }

      .section-title {
        margin: 0;
        font-weight: 700;
      }

      .hint {
        margin: 0.2rem 0;
        color: #4f626b;
        font-size: 0.84rem;
      }

      .language-actions {
        margin-top: 0.45rem;
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
        align-items: center;
      }

      ul {
        margin: 0;
        padding-left: 1.1rem;
      }

      li {
        margin-bottom: 0.3rem;
      }

      .actions {
        margin-top: 0.7rem;
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
      }

      button {
        border: 1px solid #afc6d1;
        background: #f9fcff;
        color: #1f2c33;
        border-radius: 8px;
        padding: 0.35rem 0.6rem;
        font-size: 0.81rem;
      }
    `
  ]
})
export class SettingsScreenComponent {
  protected readonly i18n = inject(I18nService);

  protected onLanguageChange(event: MatButtonToggleChange): void {
    const language = event.value;
    if (language === 'zh-Hant' || language === 'en') {
      this.i18n.setLanguage(language);
    }
  }

  protected useSystemLanguage(): void {
    this.i18n.clearOverride();
  }

  protected languageNameKey(language: AppLanguage): string {
    return language === 'zh-Hant' ? 'language.name.zhHant' : 'language.name.en';
  }
}
