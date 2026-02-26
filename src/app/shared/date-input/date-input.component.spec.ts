import { TestBed } from '@angular/core/testing';
import { DateInputComponent } from './date-input.component';

describe('DateInputComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateInputComponent]
    }).compileComponents();
  });

  it('should render yyyy-mm-dd format hint', () => {
    const fixture = TestBed.createComponent(DateInputComponent);
    fixture.componentRef.setInput('label', 'Test date');
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Format: yyyy-mm-dd');
  });

  it('should keep valid iso date values', () => {
    const fixture = TestBed.createComponent(DateInputComponent);
    fixture.componentRef.setInput('label', 'Test date');
    fixture.componentRef.setInput('value', '2026-02-01');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('2026-02-01');
  });

  it('should normalize non-padded y-m-d values to iso', () => {
    const fixture = TestBed.createComponent(DateInputComponent);
    fixture.componentRef.setInput('label', 'Test date');
    fixture.componentRef.setInput('value', '2026/2/1');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('2026-02-01');
  });

  it('should emit and normalize slash-separated direct input on blur', () => {
    const fixture = TestBed.createComponent(DateInputComponent);
    fixture.componentRef.setInput('label', 'Test date');
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const emittedValues: string[] = [];
    component.valueChange.subscribe((value: string) => emittedValues.push(value));

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = '2026/2/1';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(emittedValues.length).toBe(0);

    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(input.value).toBe('2026-02-01');
    expect(emittedValues.at(-1)).toBe('2026-02-01');
  });

  it('should emit normalized compact date input on blur', () => {
    const fixture = TestBed.createComponent(DateInputComponent);
    fixture.componentRef.setInput('label', 'Test date');
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const emittedValues: string[] = [];
    component.valueChange.subscribe((value: string) => emittedValues.push(value));

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = '20260201';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(emittedValues.length).toBe(0);

    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(emittedValues).toContain('2026-02-01');
  });

  it('should coerce invalid values to empty', () => {
    const fixture = TestBed.createComponent(DateInputComponent);
    fixture.componentRef.setInput('label', 'Test date');
    fixture.componentRef.setInput('value', '2026-02-31');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('should clear invalid direct input on blur', () => {
    const fixture = TestBed.createComponent(DateInputComponent);
    fixture.componentRef.setInput('label', 'Test date');
    fixture.componentRef.setInput('value', '2026-02-01');
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const emittedValues: string[] = [];
    component.valueChange.subscribe((value: string) => emittedValues.push(value));

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = '2026-02-31';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(emittedValues.length).toBe(0);

    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(input.value).toBe('');
    expect(emittedValues).toContain('');
  });
});
