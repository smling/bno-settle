import { Component, inject } from '@angular/core';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { I18nService } from '../../i18n/i18n.service';
import { SectionCardComponent } from '../../shared/section-card/section-card.component';

interface ChecklistItem {
  code: string;
  labelKey: string;
  status: 'todo' | 'done' | 'na';
}

@Component({
  selector: 'app-checklists-screen',
  standalone: true,
  imports: [SectionCardComponent, MatCheckboxModule],
  template: `
    <app-section-card [title]="i18n.t('checklists.title')" [subtitle]="i18n.t('checklists.subtitle')">
      <p class="track">{{ i18n.t('checklists.track.ilr') }}</p>
      <ul>
        @for (item of ilrItems; track item.code) {
          <li>
            <mat-checkbox
              [checked]="item.status === 'done'"
              [disabled]="item.status === 'na'"
              (change)="onChecklistToggle(item, $event)"
            >
              {{ i18n.t(item.labelKey) }}
            </mat-checkbox>
            <span class="state" [attr.data-status]="item.status">{{ i18n.t(statusLabelKey(item.status)) }}</span>
          </li>
        }
      </ul>

      <p class="track">{{ i18n.t('checklists.track.citizenship') }}</p>
      <ul>
        @for (item of citizenshipItems; track item.code) {
          <li>
            <mat-checkbox
              [checked]="item.status === 'done'"
              [disabled]="item.status === 'na'"
              (change)="onChecklistToggle(item, $event)"
            >
              {{ i18n.t(item.labelKey) }}
            </mat-checkbox>
            <span class="state" [attr.data-status]="item.status">{{ i18n.t(statusLabelKey(item.status)) }}</span>
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
  protected readonly i18n = inject(I18nService);

  protected readonly ilrItems: ChecklistItem[] = [
    { code: 'life_in_uk', labelKey: 'checklists.item.lifeInUk', status: 'todo' },
    { code: 'english_b1', labelKey: 'checklists.item.englishB1', status: 'done' },
    { code: 'travel_evidence', labelKey: 'checklists.item.travelEvidence', status: 'done' },
    { code: 'proof_living', labelKey: 'checklists.item.proofOfLiving', status: 'todo' },
    { code: 'proof_income', labelKey: 'checklists.item.proofOfIncome', status: 'todo' }
  ];

  protected readonly citizenshipItems: ChecklistItem[] = [
    { code: 'referees', labelKey: 'checklists.item.referees', status: 'todo' },
    { code: 'absence_review', labelKey: 'checklists.item.absenceReview', status: 'done' },
    { code: 'language', labelKey: 'checklists.item.languageContinuity', status: 'na' }
  ];

  protected onChecklistToggle(item: ChecklistItem, event: MatCheckboxChange): void {
    if (item.status === 'na') {
      return;
    }
    item.status = event.checked ? 'done' : 'todo';
  }

  protected statusLabelKey(status: ChecklistItem['status']): string {
    return `checklistStatus.${status}`;
  }
}
