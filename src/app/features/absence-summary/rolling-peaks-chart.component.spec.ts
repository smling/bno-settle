import { TestBed } from '@angular/core/testing';
import { RollingPeaksChartComponent } from './rolling-peaks-chart.component';

describe('RollingPeaksChartComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RollingPeaksChartComponent]
    }).compileComponents();
  });

  it('should render one bar per year and one max-allowed line', async () => {
    const fixture = TestBed.createComponent(RollingPeaksChartComponent);
    fixture.componentRef.setInput('yearlyData', [
      { year: 2024, daysOutside: 120 },
      { year: 2025, daysOutside: 182 }
    ]);
    fixture.detectChanges();
    await fixture.whenStable();

    const bars = fixture.nativeElement.querySelectorAll('rect.days-bar');
    const thresholdLines = fixture.nativeElement.querySelectorAll('line.threshold-line');
    expect(bars.length).toBe(2);
    expect(thresholdLines.length).toBe(1);
  });

  it('should render no bars when yearly data is empty', async () => {
    const fixture = TestBed.createComponent(RollingPeaksChartComponent);
    fixture.componentRef.setInput('yearlyData', []);
    fixture.detectChanges();
    await fixture.whenStable();

    const bars = fixture.nativeElement.querySelectorAll('rect.days-bar');
    const thresholdLines = fixture.nativeElement.querySelectorAll('line.threshold-line');
    expect(bars.length).toBe(0);
    expect(thresholdLines.length).toBe(0);
  });
});
