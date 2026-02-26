import { TestBed } from '@angular/core/testing';
import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent]
    }).compileComponents();
  });

  it('renders label text and data-label attribute', () => {
    const fixture = TestBed.createComponent(StatusBadgeComponent);
    fixture.componentInstance.label = 'Potential issue';
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.badge') as HTMLElement;
    expect(badge.textContent?.trim()).toBe('Potential issue');
    expect(badge.getAttribute('data-label')).toBe('Potential issue');
  });
});
