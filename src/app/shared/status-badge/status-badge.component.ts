import { Component, Input, inject } from '@angular/core';
import { I18nService } from '../../i18n/i18n.service';
import { ReadinessLabel } from '../../models/spec.models';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span class="badge" [attr.data-status]="statusToken()">{{ i18n.t(statusLabelKey()) }}</span>
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

      [data-status='likely-ready'] {
        color: #1b5f3d;
        background: #d2f1df;
      }

      [data-status='not-yet'] {
        color: #7a4a16;
        background: #fde4c6;
      }

      [data-status='potential-issue'] {
        color: #8a260f;
        background: #ffd6c7;
      }

      [data-status='needs-review'] {
        color: #5f284f;
        background: #f5d7f5;
      }
    `
  ]
})
export class StatusBadgeComponent {
  protected readonly i18n = inject(I18nService);
  @Input({ required: true }) label!: ReadinessLabel;

  protected statusToken(): string {
    switch (this.label) {
      case 'Likely ready':
        return 'likely-ready';
      case 'Not yet':
        return 'not-yet';
      case 'Potential issue':
        return 'potential-issue';
      case 'Needs review':
        return 'needs-review';
    }
  }

  protected statusLabelKey(): string {
    switch (this.label) {
      case 'Likely ready':
        return 'status.likelyReady';
      case 'Not yet':
        return 'status.notYet';
      case 'Potential issue':
        return 'status.potentialIssue';
      case 'Needs review':
        return 'status.needsReview';
    }
  }
}
