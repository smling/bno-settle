import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideNoopAnimations()]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render hero title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('BNO Settle');
  });

  it('should render material tabs for grouped screens', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const tabs = Array.from(compiled.querySelectorAll<HTMLElement>('[role="tab"]'));
    expect(tabs.map((tab) => tab.textContent?.trim())).toEqual([
      '🧭 Assessment',
      '✈️ Timing',
      '📄 Docs',
      '🔒 Settings'
    ]);
  });

  it('should include quick check content in assessment tab', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Quick Check');
  });

  it('should show travel tab content when selected', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const tabs = Array.from(compiled.querySelectorAll<HTMLElement>('[role="tab"]'));
    tabs[1].click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(compiled.textContent).toContain('Absence Summary');
  });

  it('should render timing grid with estimator left, travel top-right, and absence bottom-right slots', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const tabs = Array.from(compiled.querySelectorAll<HTMLElement>('[role="tab"]'));
    tabs[1].click();
    fixture.detectChanges();
    await fixture.whenStable();

    const timingGrid = compiled.querySelector('section.timing-grid');
    expect(timingGrid).not.toBeNull();
    expect(timingGrid?.querySelector('.timing-estimator app-ilr-date-estimator')).not.toBeNull();
    expect(timingGrid?.querySelector('.timing-travel-log app-travel-log-screen')).not.toBeNull();
    expect(
      timingGrid?.querySelector('.timing-absence-summary app-absence-summary-screen')
    ).not.toBeNull();
  });
});
