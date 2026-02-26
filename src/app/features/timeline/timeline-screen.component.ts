import { Component } from '@angular/core';
import { SectionCardComponent } from '../../shared/section-card/section-card.component';

@Component({
  selector: 'app-timeline-screen',
  standalone: true,
  imports: [SectionCardComponent],
  template: `
    <app-section-card title="Timeline" subtitle="Month-based milestones with optional day details.">
      <ol>
        @for (milestone of milestones; track milestone.label) {
          <li>
            <strong>{{ milestone.label }}:</strong>
            {{ milestone.window }}
          </li>
        }
      </ol>
    </app-section-card>
  `,
  styles: [
    `
      ol {
        margin: 0;
        padding-left: 1.1rem;
      }

      li {
        margin-bottom: 0.4rem;
        line-height: 1.35;
      }
    `
  ]
})
export class TimelineScreenComponent {
  protected readonly milestones = [
    { label: 'BN(O) residence year 5', window: '2028-02 (ILR planning starts)' },
    { label: 'Earliest ILR submission', window: 'Up to ~28 days before full 60 months' },
    { label: 'Citizenship window', window: '12+ months after ILR unless spouse route applies' }
  ];
}
