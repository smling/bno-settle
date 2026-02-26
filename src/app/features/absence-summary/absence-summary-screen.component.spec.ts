import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { IlrEstimateStateService } from '../../services/ilr-estimate-state.service';
import { AbsenceSummaryScreenComponent } from './absence-summary-screen.component';
import { TravelLogScreenComponent } from '../travel-log/travel-log-screen.component';

describe('AbsenceSummaryScreenComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbsenceSummaryScreenComponent],
      providers: [provideNoopAnimations()]
    }).compileComponents();
  });

  it('should compose summary table and chart subcomponents', async () => {
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
    expect(compiled.querySelector('table.value-table')).toBeTruthy();
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

  it('should highlight rolling 12-month threshold breaches in rolling peak log', async () => {
    const state = TestBed.inject(IlrEstimateStateService);
    state.setEstimate('2024-03-01', {
      visaApprovedDate: '2024-03-01',
      visaExpiryDate: '2029-03-01',
      earliestIlrApplyDate: '2029-02-01'
    });

    const absenceFixture = TestBed.createComponent(AbsenceSummaryScreenComponent);
    absenceFixture.detectChanges();
    await absenceFixture.whenStable();

    const travelFixture = TestBed.createComponent(TravelLogScreenComponent);
    const travelComponent = travelFixture.componentInstance as unknown as {
      form: {
        departDate: string;
        returnDate: string;
        destinationCountryCode: string;
        tag: 'holiday' | 'work' | 'family' | 'other' | '';
      };
      saveRecord: () => void;
    };

    travelComponent.form = {
      departDate: '2025-01-01',
      returnDate: '2025-07-01',
      destinationCountryCode: 'US',
      tag: 'holiday'
    };
    travelComponent.saveRecord();

    absenceFixture.detectChanges();
    await absenceFixture.whenStable();

    const host = absenceFixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Warning: rolling 12-month absences exceed 180 days');
    expect(host.textContent).toContain('Over limit');
    expect(host.querySelectorAll('tr.threshold-exceeded-row').length).toBeGreaterThan(0);
  });

  it('should recompute summary when travel-log records change', async () => {
    const state = TestBed.inject(IlrEstimateStateService);
    state.setEstimate('2024-03-01', {
      visaApprovedDate: '2024-03-01',
      visaExpiryDate: '2029-03-01',
      earliestIlrApplyDate: '2029-02-01'
    });

    const absenceFixture = TestBed.createComponent(AbsenceSummaryScreenComponent);
    absenceFixture.detectChanges();
    await absenceFixture.whenStable();
    const absenceComponent = absenceFixture.componentInstance as unknown as {
      summary: { daysOutsideLast5YearsTotal: number };
    };
    const beforeTotal = absenceComponent.summary.daysOutsideLast5YearsTotal;

    const travelFixture = TestBed.createComponent(TravelLogScreenComponent);
    const travelComponent = travelFixture.componentInstance as unknown as {
      form: {
        departDate: string;
        returnDate: string;
        destinationCountryCode: string;
        tag: 'holiday' | 'work' | 'family' | 'other' | '';
      };
      saveRecord: () => void;
    };

    travelComponent.form = {
      departDate: '2025-07-01',
      returnDate: '2025-07-01',
      destinationCountryCode: 'US',
      tag: 'holiday'
    };
    travelComponent.saveRecord();

    await absenceFixture.whenStable();

    expect(absenceComponent.summary.daysOutsideLast5YearsTotal).toBe(beforeTotal + 1);
  });
});
