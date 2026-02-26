import { TestBed } from '@angular/core/testing';
import { AbsenceSummaryMetricsComponent } from './absence-summary-metrics.component';

describe('AbsenceSummaryMetricsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbsenceSummaryMetricsComponent]
    }).compileComponents();
  });

  it('should render summary totals', () => {
    const fixture = TestBed.createComponent(AbsenceSummaryMetricsComponent);
    fixture.componentRef.setInput('summary', {
      daysOutsideLast12Months: 88,
      maxDaysOutsideInAnyRolling12Months: 182,
      daysOutsideLast5YearsTotal: 410,
      rolling12MonthPeaks: []
    });
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(text).toContain('88 days outside UK');
    expect(text).toContain('182 days');
    expect(text).toContain('410 days');
  });
});
