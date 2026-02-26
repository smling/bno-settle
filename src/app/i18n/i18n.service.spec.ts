import { TestBed } from '@angular/core/testing';
import { I18nService } from './i18n.service';

describe('I18nService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('applies and persists manual language override', () => {
    const service = TestBed.inject(I18nService);

    service.setLanguage('zh-Hant');

    expect(service.currentLanguage()).toBe('zh-Hant');
    expect(service.hasOverride()).toBe(true);
    expect(service.t('app.tab.assessment')).toBe('🧭 評估');
  });

  it('clears manual override and removes persisted value', () => {
    const service = TestBed.inject(I18nService);
    service.setLanguage('en');

    service.clearOverride();

    expect(service.hasOverride()).toBe(false);
  });
});
