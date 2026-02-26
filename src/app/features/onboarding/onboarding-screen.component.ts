import { Component } from '@angular/core';
import { SectionCardComponent } from '../../shared/section-card/section-card.component';

@Component({
  selector: 'app-onboarding-screen',
  standalone: true,
  imports: [SectionCardComponent],
  template: `
    <app-section-card
      title="Onboarding"
      subtitle="Privacy notice, scope limits, and local-only processing summary."
    >
      <ul>
        <li>No account, no sync, no server-side storage.</li>
        <li>Travel data remains on-device and should be encrypted at rest.</li>
        <li>Outputs are non-binding guidance labels only.</li>
      </ul>
    </app-section-card>
  `,
  styles: [
    `
      ul {
        margin: 0;
        padding-left: 1.1rem;
      }

      li {
        margin-bottom: 0.3rem;
        line-height: 1.35;
      }
    `
  ]
})
export class OnboardingScreenComponent {}
