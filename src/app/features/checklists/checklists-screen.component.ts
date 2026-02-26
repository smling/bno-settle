import { Component } from '@angular/core';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { SectionCardComponent } from '../../shared/section-card/section-card.component';

interface ChecklistItem {
  code: string;
  label: string;
  status: 'todo' | 'done' | 'na';
}

@Component({
  selector: 'app-checklists-screen',
  standalone: true,
  imports: [SectionCardComponent, MatCheckboxModule],
  template: `
    <app-section-card title="Checklists" subtitle="Document preparation status for ILR and citizenship.">
      <p class="track">ILR:</p>
      <ul>
        @for (item of ilrItems; track item.code) {
          <li>
            <mat-checkbox
              [checked]="item.status === 'done'"
              [disabled]="item.status === 'na'"
              (change)="onChecklistToggle(item, $event)"
            >
              {{ item.label }}
            </mat-checkbox>
            <span class="state" [attr.data-status]="item.status">{{ item.status }}</span>
          </li>
        }
      </ul>

      <p class="track">Citizenship:</p>
      <ul>
        @for (item of citizenshipItems; track item.code) {
          <li>
            <mat-checkbox
              [checked]="item.status === 'done'"
              [disabled]="item.status === 'na'"
              (change)="onChecklistToggle(item, $event)"
            >
              {{ item.label }}
            </mat-checkbox>
            <span class="state" [attr.data-status]="item.status">{{ item.status }}</span>
          </li>
        }
      </ul>
    </app-section-card>
  `,
  styles: [
    `
      .track {
        margin: 0.2rem 0 0.35rem;
        font-weight: 700;
      }

      ul {
        margin: 0 0 0.7rem;
        padding-left: 0;
        list-style: none;
      }

      li {
        margin-bottom: 0.25rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
      }

      .state {
        text-transform: uppercase;
        font-size: 0.72rem;
        color: #4f626b;
      }

      [data-status='done'] {
        color: #1b5f3d;
      }

      [data-status='todo'] {
        color: #8a260f;
      }
    `
  ]
})
export class ChecklistsScreenComponent {
  protected readonly ilrItems: ChecklistItem[] = [
    { code: 'life_in_uk', label: 'Life in the UK test pass', status: 'todo' },
    { code: 'english_b1', label: 'English B1 / exemption', status: 'done' },
    { code: 'travel_evidence', label: 'Travel evidence cross-check', status: 'done' }
  ];

  protected readonly citizenshipItems: ChecklistItem[] = [
    { code: 'referees', label: 'Referee details prepared', status: 'todo' },
    { code: 'absence_review', label: 'Absence history reviewed', status: 'done' },
    { code: 'language', label: 'Language requirement continuity', status: 'na' }
  ];

  protected onChecklistToggle(item: ChecklistItem, event: MatCheckboxChange): void {
    if (item.status === 'na') {
      return;
    }
    item.status = event.checked ? 'done' : 'todo';
  }
}
