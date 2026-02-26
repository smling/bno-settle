import { Component, inject, signal } from '@angular/core';
import { I18nService } from '../../i18n/i18n.service';
import { SectionCardComponent } from '../../shared/section-card/section-card.component';

interface OfficialReference {
  docId: string;
  nameKey: string;
  url: string;
}

@Component({
  selector: 'app-official-references-screen',
  standalone: true,
  imports: [SectionCardComponent],
  template: `
    <app-section-card
      [title]="i18n.t('officialReferences.title')"
      [subtitle]="i18n.t('officialReferences.subtitle')"
    >
      <ul>
        @for (ref of references; track ref.docId) {
          <li>
            <a
              [href]="ref.url"
              target="_blank"
              rel="noopener noreferrer"
              (click)="markAccess(ref.docId)"
            >
              {{ i18n.t(ref.nameKey) }}
            </a>
            @if (recentAccess()[ref.docId]) {
              <small>
                {{
                  i18n.t('officialReferences.lastAccessed', {
                    timestamp: recentAccess()[ref.docId]
                  })
                }}
              </small>
            }
          </li>
        }
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
        margin-bottom: 0.55rem;
      }

      a {
        color: #224d87;
        font-weight: 600;
      }

      small {
        display: block;
        color: #4f626b;
        margin-top: 0.15rem;
      }
    `
  ]
})
export class OfficialReferencesScreenComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly references: OfficialReference[] = [
    {
      docId: 'bno-settlement',
      nameKey: 'officialReferences.bnoSettlement',
      url: 'https://www.gov.uk/british-national-overseas-bno-visa'
    },
    {
      docId: 'life-in-uk',
      nameKey: 'officialReferences.lifeInUk',
      url: 'https://www.gov.uk/life-in-the-uk-test'
    },
    {
      docId: 'naturalisation',
      nameKey: 'officialReferences.naturalisation',
      url: 'https://www.gov.uk/apply-citizenship-indefinite-leave-to-remain'
    }
  ];

  protected readonly recentAccess = signal<Record<string, string>>({});

  protected markAccess(docId: string): void {
    this.recentAccess.update((state) => ({
      ...state,
      [docId]: new Date().toISOString()
    }));
  }
}
