import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { IlrEstimateStateService } from '../../services/ilr-estimate-state.service';
import { IlrDateEstimatorComponent } from './ilr-date-estimator.component';

describe('IlrDateEstimatorComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IlrDateEstimatorComponent],
      providers: [provideNoopAnimations()]
    }).compileComponents();
  });

  it('should render calculated ILR timeline after submit', async () => {
    const fixture = TestBed.createComponent(IlrDateEstimatorComponent);
    const component = fixture.componentInstance;
    component.visaApprovedDate = '2024-03-01';

    component.calculate();
    fixture.detectChanges();
    await fixture.whenStable();

    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(text).toContain('Visa expiry date');
    expect(text).toContain('Earliest ILR apply date');
    expect(text).toContain('2029-03-01');
    expect(text).toContain('2029-02-01');
  });

  it('should calculate when the form is submitted', async () => {
    const fixture = TestBed.createComponent(IlrDateEstimatorComponent);
    const component = fixture.componentInstance;
    component.visaApprovedDate = '2024-03-01';
    fixture.detectChanges();

    const form = (fixture.nativeElement as HTMLElement).querySelector('form');
    form?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();

    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(component.estimate).not.toBeNull();
    expect(text).toContain('Earliest ILR apply date');
    expect(text).toContain('2029-02-01');
  });

  it('should show validation message for invalid input', async () => {
    const fixture = TestBed.createComponent(IlrDateEstimatorComponent);
    const component = fixture.componentInstance;
    component.visaApprovedDate = 'invalid-date';

    component.calculate();
    fixture.detectChanges();
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Enter a valid visa approved date.'
    );
  });

  it('should render estimator form with single-column grid and end actions', () => {
    const fixture = TestBed.createComponent(IlrDateEstimatorComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const form = host.querySelector('form.editor');
    const gridList = host.querySelector('mat-grid-list');
    const tiles = host.querySelectorAll('mat-grid-tile');
    const actions = host.querySelector('.actions');
    const submitButton = actions?.querySelector('button[type="submit"]');

    expect(form).not.toBeNull();
    expect(gridList?.getAttribute('cols')).toBe('1');
    expect(tiles.length).toBe(2);
    expect(submitButton?.classList.contains('estimate-btn')).toBe(true);
  });

  it('should publish calculated estimate to shared ILR state', () => {
    const state = TestBed.inject(IlrEstimateStateService);
    const fixture = TestBed.createComponent(IlrDateEstimatorComponent);
    const component = fixture.componentInstance;
    component.visaApprovedDate = '2024-03-01';

    component.calculate();

    expect(state.visaApprovedDate()).toBe('2024-03-01');
    expect(state.estimate()?.visaExpiryDate).toBe('2029-03-01');
  });

  it('should publish visa approved date changes before calculate', () => {
    const state = TestBed.inject(IlrEstimateStateService);
    const fixture = TestBed.createComponent(IlrDateEstimatorComponent);
    const component = fixture.componentInstance as unknown as {
      onVisaApprovedDateChange: (value: string) => void;
    };

    component.onVisaApprovedDateChange('2024-04-15');

    expect(state.visaApprovedDate()).toBe('2024-04-15');
    expect(state.estimate()).toBeNull();
  });
});
