import { Component } from '@angular/core';
import { SectionCardComponent } from '../../shared/section-card/section-card.component';

@Component({
  selector: 'app-settings-screen',
  standalone: true,
  imports: [SectionCardComponent],
  template: `
    <app-section-card title="Settings" subtitle="Privacy controls, export actions, and local data management.">
      <ul>
        <li>Travel log enabled: <strong>Yes</strong></li>
        <li>Vault lock state: <strong>Locked</strong></li>
        <li>Retention policy: <strong>Auto-expire after 5 years</strong></li>
      </ul>
      <div class="actions">
        <button type="button">Set / Change passphrase</button>
        <button type="button">Export JSON</button>
        <button type="button">Clear all data</button>
      </div>
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
      }

      .actions {
        margin-top: 0.7rem;
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
      }

      button {
        border: 1px solid #afc6d1;
        background: #f9fcff;
        color: #1f2c33;
        border-radius: 8px;
        padding: 0.35rem 0.6rem;
        font-size: 0.81rem;
      }
    `
  ]
})
export class SettingsScreenComponent {}
