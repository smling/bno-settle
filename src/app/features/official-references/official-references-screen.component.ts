import { Component, signal } from '@angular/core';
import { SectionCardComponent } from '../../shared/section-card/section-card.component';

interface OfficialReference {
  docId: string;
  name: string;
  url: string;
}

@Component({
  selector: 'app-official-references-screen',
  standalone: true,
  imports: [SectionCardComponent],
  template: `
    <app-section-card title="Official References" subtitle="Whitelisted GOV.UK links with local recent-access metadata.">
      <ul>
        @for (ref of references; track ref.docId) {
          <li>
            <a
              [href]="ref.url"
              target="_blank"
              rel="noopener noreferrer"
              (click)="markAccess(ref.docId)"
            >
              {{ ref.name }}
            </a>
            @if (recentAccess()[ref.docId]) {
              <small>Last accessed: {{ recentAccess()[ref.docId] }}</small>
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
  protected readonly references: OfficialReference[] = [
    {
      docId: 'bno-settlement',
      name: 'BN(O) visa and settlement guidance',
      url: 'https://www.gov.uk/british-national-overseas-bno-visa'
    },
    {
      docId: 'life-in-uk',
      name: 'Life in the UK test',
      url: 'https://www.gov.uk/life-in-the-uk-test'
    },
    {
      docId: 'naturalisation',
      name: 'Apply for citizenship (naturalisation)',
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
