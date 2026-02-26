import { Component, Input } from '@angular/core';
import { ReadinessLabel } from '../../models/spec.models';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span class="badge" [attr.data-label]="label">{{ label }}</span>
  `,
  styles: [
    `
      .badge {
        border-radius: 999px;
        display: inline-block;
        font-size: 0.78rem;
        letter-spacing: 0.01em;
        padding: 0.2rem 0.62rem;
        font-weight: 700;
      }

      [data-label='Likely ready'] {
        color: #1b5f3d;
        background: #d2f1df;
      }

      [data-label='Not yet'] {
        color: #7a4a16;
        background: #fde4c6;
      }

      [data-label='Potential issue'] {
        color: #8a260f;
        background: #ffd6c7;
      }

      [data-label='Needs review'] {
        color: #5f284f;
        background: #f5d7f5;
      }
    `
  ]
})
export class StatusBadgeComponent {
  @Input({ required: true }) label!: ReadinessLabel;
}
