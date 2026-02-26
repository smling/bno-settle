import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { IlrEstimateStateService } from '../../services/ilr-estimate-state.service';
import { AbsenceSummaryScreenComponent } from './absence-summary-screen.component';

describe('AbsenceSummaryScreenComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbsenceSummaryScreenComponent],
      providers: [provideNoopAnimations()]
    }).compileComponents();
  });

  it('should compose metrics and chart subcomponents', async () => {
    const state = TestBed.inject(IlrEstimateStateService);
    state.setEstimate('2024-03-01', {
      visaApprovedDate: '2024-03-01',
      visaExpiryDate: '2029-03-01',
      earliestIlrApplyDate: '2029-02-01'
    });
    const fixture = TestBed.createComponent(AbsenceSummaryScreenComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-absence-summary-metrics')).toBeTruthy();
    expect(compiled.querySelector('app-rolling-peaks-chart')).toBeTruthy();
    expect(compiled.textContent).toContain('Rolling peak details');
  });

  it('should group travel records by year and show yearly totals', async () => {
    const state = TestBed.inject(IlrEstimateStateService);
    state.setEstimate('2024-03-01', {
      visaApprovedDate: '2024-03-01',
      visaExpiryDate: '2029-03-01',
      earliestIlrApplyDate: '2029-02-01'
    });
    const fixture = TestBed.createComponent(AbsenceSummaryScreenComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Yearly summary (visa period)');
    expect(text).toContain('Using travel log records from 2024-03-01 to 2029-03-01.');
    expect(text).toContain('2025');
    expect(text).toContain('20');
  });

  it('should ask for ILR estimation when there is no estimator result', async () => {
    const fixture = TestBed.createComponent(AbsenceSummaryScreenComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Calculate ILR dates first. This summary uses visa approved date and visa expiry date.'
    );
  });
});
