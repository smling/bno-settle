import { Component } from '@angular/core';
import { SectionCardComponent } from '../../shared/section-card/section-card.component';

@Component({
  selector: 'app-privacy-debug-screen',
  standalone: true,
  imports: [SectionCardComponent],
  template: `
    <app-section-card title="Privacy / Debug" subtitle="Compliance evidence and local runtime safety summary.">
      <p><strong>CSP:</strong> default-src 'self'; connect-src 'none'; frame-ancestors 'none'.</p>
      <p><strong>Session network requests:</strong> 0 (best-effort meter).</p>
      <p><strong>Telemetry:</strong> No analytics, no remote logging, no background sync.</p>
    </app-section-card>
  `,
  styles: [
    `
      p {
        margin: 0 0 0.5rem;
        line-height: 1.35;
      }
    `
  ]
})
export class PrivacyDebugScreenComponent {}
