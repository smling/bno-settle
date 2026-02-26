import { TestBed } from '@angular/core/testing';
import { OfficialReferencesScreenComponent } from './official-references-screen.component';

describe('OfficialReferencesScreenComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfficialReferencesScreenComponent]
    }).compileComponents();
  });

  it('tracks recent access when a reference link is clicked', () => {
    const fixture = TestBed.createComponent(OfficialReferencesScreenComponent);
    fixture.detectChanges();

    const firstLink = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    firstLink.click();
    fixture.detectChanges();

    const helperText = fixture.nativeElement.querySelector('small') as HTMLElement;
    expect(helperText.textContent).toContain('Last accessed:');
  });
});
