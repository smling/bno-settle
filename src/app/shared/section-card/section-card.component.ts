import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-section-card',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <mat-card class="section-card" appearance="outlined">
      <mat-card-header>
        <mat-card-title>{{ title }}</mat-card-title>
        @if (subtitle) {
          <mat-card-subtitle>{{ subtitle }}</mat-card-subtitle>
        }
      </mat-card-header>
      <mat-card-content>
        <ng-content />
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .section-card {
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.74);
        box-shadow: 0 8px 20px rgba(21, 35, 44, 0.06);
        animation: reveal 320ms ease both;
      }

      .section-card :where(.mat-mdc-card-header, .mdc-card__primary-action) {
        padding-bottom: 0.3rem;
      }

      .section-card mat-card-title {
        margin: 0;
        font-size: 1.06rem;
        font-family: 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', 'Noto Sans', sans-serif;
      }

      .section-card mat-card-subtitle {
        margin: 0.35rem 0 0;
        color: #4f626b;
        line-height: 1.4;
      }

      .section-card mat-card-content {
        padding-top: 0.25rem;
      }

      @keyframes reveal {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `
  ]
})
export class SectionCardComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle = '';
}
