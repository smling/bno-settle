import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TravelLogScreenComponent } from './travel-log-screen.component';

interface DateRangeSample {
  start: string;
  end: string;
}

type MutableTravelLogComponent = {
  records: Array<{
    id: string;
    departDate: string;
    returnDate: string;
    destinationCountryCode: string;
    tag?: 'holiday' | 'work' | 'family' | 'other';
  }>;
  form: {
    departDate: string;
    returnDate: string;
    destinationCountryCode: string;
    tag: 'holiday' | 'work' | 'family' | 'other' | '';
  };
  editingRecordId: string | null;
  errorMessage: string;
  saveRecord: () => void;
  startEdit: (record: {
    id: string;
    departDate: string;
    returnDate: string;
    destinationCountryCode: string;
    tag?: 'holiday' | 'work' | 'family' | 'other';
  }) => void;
  removeRecord: (recordId: string) => void;
};

function applyDateRange(
  component: MutableTravelLogComponent,
  range: DateRangeSample,
  destinationCountryCode: string,
  tag: 'holiday' | 'work' | 'family' | 'other' | ''
): void {
  component.form = {
    departDate: range.start,
    returnDate: range.end,
    destinationCountryCode,
    tag
  };
}

describe('TravelLogScreenComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TravelLogScreenComponent],
      providers: [provideNoopAnimations()]
    }).compileComponents();
  });

  it('should add a new travel record', () => {
    const fixture = TestBed.createComponent(TravelLogScreenComponent);
    const component = fixture.componentInstance as unknown as MutableTravelLogComponent;
    const initialCount = component.records.length;
    const tripRange: DateRangeSample = { start: '2026-01-01', end: '2026-01-08' };

    applyDateRange(component, tripRange, 'US', 'holiday');
    component.saveRecord();

    expect(component.records.length).toBe(initialCount + 1);
    expect(component.records[0].destinationCountryCode).toBe('US');
    expect(component.records[0].tag).toBe('holiday');
  });

  it('should render the form in a single-column grid list', () => {
    const fixture = TestBed.createComponent(TravelLogScreenComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const form = host.querySelector('form.editor');
    const gridList = host.querySelector('mat-grid-list');
    const tiles = host.querySelectorAll('mat-grid-tile');

    expect(form).not.toBeNull();
    expect(gridList).not.toBeNull();
    expect(gridList?.getAttribute('cols')).toBe('1');
    expect(tiles.length).toBe(3);
  });

  it('should validate date order before adding record', () => {
    const fixture = TestBed.createComponent(TravelLogScreenComponent);
    const component = fixture.componentInstance as unknown as MutableTravelLogComponent;
    const initialCount = component.records.length;
    const invalidRange: DateRangeSample = { start: '2026-02-10', end: '2026-02-01' };

    applyDateRange(component, invalidRange, 'HK', '');
    component.saveRecord();

    expect(component.records.length).toBe(initialCount);
    expect(component.errorMessage).toContain('Return date must be on or after depart date.');
  });

  it('should edit an existing record', () => {
    const fixture = TestBed.createComponent(TravelLogScreenComponent);
    const component = fixture.componentInstance as unknown as MutableTravelLogComponent;
    const target = component.records[0];

    component.startEdit(target);
    component.form.destinationCountryCode = 'SG';
    component.form.tag = 'work';
    component.saveRecord();

    expect(component.records[0].destinationCountryCode).toBe('SG');
    expect(component.records[0].tag).toBe('work');
    expect(component.editingRecordId).toBeNull();
  });

  it('should remove a record by id', () => {
    const fixture = TestBed.createComponent(TravelLogScreenComponent);
    const component = fixture.componentInstance as unknown as MutableTravelLogComponent;
    const removableId = component.records[0].id;

    component.removeRecord(removableId);
    expect(component.records.some((record) => record.id === removableId)).toBe(false);
  });
});
