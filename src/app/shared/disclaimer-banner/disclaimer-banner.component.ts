import { Component } from '@angular/core';

@Component({
  selector: 'app-disclaimer-banner',
  standalone: true,
  template: `
    <aside class="disclaimer" aria-label="Legal disclaimer">
      <strong>General information only - not legal advice.</strong>
      <span>Rules change. Verify with official GOV.UK sources. Complex cases may need regulated professional advice.</span>
    </aside>
  `,
  styles: [
    `
      .disclaimer {
        margin: 0 0 1rem;
        border: 1px solid #bcced9;
        background: #f7fbff;
        border-radius: 10px;
        padding: 0.7rem 0.85rem;
        display: grid;
        gap: 0.15rem;
        color: #304148;
        line-height: 1.35;
      }

      .disclaimer strong {
        font-size: 0.93rem;
      }

      .disclaimer span {
        font-size: 0.86rem;
      }
    `
  ]
})
export class DisclaimerBannerComponent {}
