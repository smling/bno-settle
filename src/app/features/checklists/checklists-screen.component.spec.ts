import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ChecklistsScreenComponent } from './checklists-screen.component';

describe('ChecklistsScreenComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChecklistsScreenComponent],
      providers: [provideNoopAnimations()]
    }).compileComponents();
  });

  it('should render one checkbox per checklist item', async () => {
    const fixture = TestBed.createComponent(ChecklistsScreenComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const checkboxes = fixture.nativeElement.querySelectorAll('mat-checkbox');
    expect(checkboxes.length).toBe(8);
  });

  it('should update item status when checkbox state changes', () => {
    const fixture = TestBed.createComponent(ChecklistsScreenComponent);
    const component = fixture.componentInstance as unknown as {
      ilrItems: Array<{ status: 'todo' | 'done' | 'na' }>;
      onChecklistToggle: (item: { status: 'todo' | 'done' | 'na' }, event: { checked: boolean }) => void;
    };
    const item = component.ilrItems[0];

    expect(item.status).toBe('todo');
    component.onChecklistToggle(item, { checked: true });
    expect(item.status).toBe('done');
    component.onChecklistToggle(item, { checked: false });
    expect(item.status).toBe('todo');
  });

  it('should keep na items unchanged on toggle attempts', () => {
    const fixture = TestBed.createComponent(ChecklistsScreenComponent);
    const component = fixture.componentInstance as unknown as {
      citizenshipItems: Array<{ status: 'todo' | 'done' | 'na' }>;
      onChecklistToggle: (item: { status: 'todo' | 'done' | 'na' }, event: { checked: boolean }) => void;
    };
    const item = component.citizenshipItems[2];

    expect(item.status).toBe('na');
    component.onChecklistToggle(item, { checked: true });
    expect(item.status).toBe('na');
  });
});
