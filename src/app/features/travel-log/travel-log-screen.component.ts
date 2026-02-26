import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TravelTimingContext } from '../../models/travel-timing-context.model';
import { TravelRecord } from '../../models/spec.models';
import { TravelLogStateService } from '../../services/travel-log-state.service';
import { SectionCardComponent } from '../../shared/section-card/section-card.component';

interface CountryOption {
  code: string;
  label: string;
  flag: string;
}

interface TravelFormModel {
  departDate: string;
  returnDate: string;
  destinationCountryCode: string;
  tag: TravelRecord['tag'] | '';
}

type DateRangeBoundary = 'start' | 'end';

@Component({
  selector: 'app-travel-log-screen',
  standalone: true,
  imports: [
    FormsModule,
    SectionCardComponent,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatGridListModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <app-section-card title="Travel Log" subtitle="Exact dates + destination country code only.">
      <form class="editor" (ngSubmit)="saveRecord()">
        <mat-grid-list cols="1" rowHeight="7rem" gutterSize="10px" class="form-grid">
          <mat-grid-tile>
            <mat-form-field appearance="outline" class="date-range-field">
              <mat-label>Travel period</mat-label>
              <mat-date-range-input [rangePicker]="picker">
                <input
                  matStartDate
                  placeholder="Depart date"
                  [value]="dateRange.start"
                  (dateInput)="onDateRangeChange('start', $event.value)"
                  (dateChange)="onDateRangeChange('start', $event.value)"
                  required
                />
                <input
                  matEndDate
                  placeholder="Return date"
                  [value]="dateRange.end"
                  (dateInput)="onDateRangeChange('end', $event.value)"
                  (dateChange)="onDateRangeChange('end', $event.value)"
                  required
                />
              </mat-date-range-input>
              <mat-datepicker-toggle matIconSuffix [for]="picker" />
              <mat-date-range-picker #picker />
              <mat-hint>Select depart and return dates</mat-hint>
            </mat-form-field>
          </mat-grid-tile>

          <mat-grid-tile>
            <mat-form-field appearance="outline" class="country-field">
              <mat-label>Country</mat-label>
              <mat-select
                name="destinationCountryCode"
                [(ngModel)]="form.destinationCountryCode"
                required
              >
                <mat-select-trigger>{{ countryDisplay(form.destinationCountryCode) }}</mat-select-trigger>
                @for (country of countries; track country.code) {
                  <mat-option [value]="country.code">
                    {{ country.flag }} {{ country.code }} - {{ country.label }}
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>
          </mat-grid-tile>

          <mat-grid-tile>
            <mat-form-field appearance="outline">
              <mat-label>Tag</mat-label>
              <mat-select name="tag" [(ngModel)]="form.tag">
                <mat-option value="">None</mat-option>
                <mat-option value="holiday">holiday</mat-option>
                <mat-option value="work">work</mat-option>
                <mat-option value="family">family</mat-option>
                <mat-option value="other">other</mat-option>
              </mat-select>
            </mat-form-field>
          </mat-grid-tile>
        </mat-grid-list>

        <div class="actions">
          <button
            mat-flat-button
            color="primary"
            type="submit"
            class="emoji-btn"
            [attr.aria-label]="editingRecordId ? 'Update record' : 'Add record'"
            [attr.title]="editingRecordId ? 'Update record' : 'Add record'"
          >
            {{ editingRecordId ? '✅' : '➕' }}
          </button>
          @if (editingRecordId) {
            <button
              mat-stroked-button
              type="button"
              class="emoji-btn"
              (click)="cancelEdit()"
              aria-label="Cancel edit"
              title="Cancel edit"
            >
              ↩️
            </button>
          }
        </div>
      </form>

      @if (errorMessage) {
        <p class="error">{{ errorMessage }}</p>
      }

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Depart</th>
              <th>Return</th>
              <th>Country</th>
              <th>Tag</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (record of records; track record.id) {
              <tr>
                <td>{{ record.departDate }}</td>
                <td>{{ record.returnDate }}</td>
                <td>{{ countryDisplay(record.destinationCountryCode) }}</td>
                <td>{{ record.tag ?? '-' }}</td>
                <td class="row-actions">
                  <button
                    mat-icon-button
                    type="button"
                    (click)="startEdit(record)"
                    aria-label="Edit record"
                    title="Edit record"
                  >
                    ✏️
                  </button>
                  <button
                    mat-icon-button
                    type="button"
                    (click)="removeRecord(record.id)"
                    aria-label="Remove record"
                    title="Remove record"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5">No travel records yet.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </app-section-card>
  `,
  styles: [
    `
      .editor {
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
        margin-bottom: 0.8rem;
      }

      .form-grid {
        width: 100%;
      }

      .form-grid .mat-mdc-form-field {
        width: 100%;
      }

      .field-span-full {
        grid-column: 1 / -1;
      }

      .date-range-field,
      .country-field {
        min-width: 0;
      }

      .actions {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        justify-content: flex-end;
      }

      .emoji-btn {
        min-width: 2.5rem;
        width: 2.5rem;
        padding: 0;
        font-size: 1.2rem;
        line-height: 1;
      }

      .error {
        margin: 0.1rem 0 0.5rem;
        color: #8a260f;
      }

      .table-wrap {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }

      table {
        width: 100%;
        min-width: 560px;
        border-collapse: collapse;
        font-size: 0.85rem;
      }

      th,
      td {
        text-align: left;
        border-bottom: 1px solid #d7e3ea;
        padding: 0.35rem 0.2rem;
      }

      .row-actions {
        display: flex;
        gap: 0.1rem;
      }
    `
  ]
})
export class TravelLogScreenComponent {
  @Input() public travelTimingContext: TravelTimingContext | null = null;

  protected readonly countries: CountryOption[] = [
    { code: 'HK', label: 'Hong Kong', flag: '🇭🇰' },
    { code: 'GB', label: 'United Kingdom', flag: '🇬🇧' },
    { code: 'JP', label: 'Japan', flag: '🇯🇵' },
    { code: 'FR', label: 'France', flag: '🇫🇷' },
    { code: 'US', label: 'United States', flag: '🇺🇸' },
    { code: 'CA', label: 'Canada', flag: '🇨🇦' },
    { code: 'AU', label: 'Australia', flag: '🇦🇺' },
    { code: 'SG', label: 'Singapore', flag: '🇸🇬' }
  ];

  protected form: TravelFormModel = {
    departDate: '',
    returnDate: '',
    destinationCountryCode: 'HK',
    tag: ''
  };
  protected dateRange: { start: Date | null; end: Date | null } = {
    start: null,
    end: null
  };

  protected editingRecordId: string | null = null;
  protected errorMessage = '';

  constructor(private readonly travelLogStateService: TravelLogStateService) {}

  protected get records(): TravelRecord[] {
    if (this.travelTimingContext) {
      return this.travelTimingContext.records();
    }
    return this.travelLogStateService.records();
  }

  protected saveRecord(): void {
    this.errorMessage = '';
    if (!this.form.departDate || !this.form.returnDate || !this.form.destinationCountryCode) {
      this.errorMessage = 'Depart date, return date, and country are required.';
      return;
    }
    if (this.form.returnDate < this.form.departDate) {
      this.errorMessage = 'Return date must be on or after depart date.';
      return;
    }

    if (this.editingRecordId) {
      this.updateExistingRecord(this.editingRecordId);
      this.cancelEdit();
      return;
    }

    const now = new Date().toISOString();
    this.addRecord({
      id: `trip_${Date.now()}`,
      departDate: this.form.departDate,
      returnDate: this.form.returnDate,
      destinationCountryCode: this.form.destinationCountryCode,
      tag: this.form.tag || undefined,
      createdAt: now,
      updatedAt: now
    });
    this.resetForm();
  }

  protected startEdit(record: TravelRecord): void {
    this.editingRecordId = record.id;
    this.errorMessage = '';
    this.form = {
      departDate: record.departDate,
      returnDate: record.returnDate,
      destinationCountryCode: record.destinationCountryCode,
      tag: record.tag ?? ''
    };
    this.dateRange = {
      start: this.fromIsoDate(record.departDate),
      end: this.fromIsoDate(record.returnDate)
    };
  }

  protected cancelEdit(): void {
    this.editingRecordId = null;
    this.errorMessage = '';
    this.resetForm();
  }

  protected removeRecord(recordId: string): void {
    this.removeRecordFromState(recordId);
    if (this.editingRecordId === recordId) {
      this.cancelEdit();
    }
  }

  protected countryDisplay(code: string): string {
    const country = this.countries.find((option) => option.code === code);
    if (!country) {
      return code;
    }
    return `${country.flag} ${country.code}`;
  }

  private updateExistingRecord(recordId: string): void {
    const updated = this.updateRecord(recordId, {
      departDate: this.form.departDate,
      returnDate: this.form.returnDate,
      destinationCountryCode: this.form.destinationCountryCode,
      tag: this.form.tag || undefined,
      updatedAt: new Date().toISOString()
    });
    if (!updated) {
      this.errorMessage = 'Record to update was not found.';
    }
  }

  private addRecord(record: TravelRecord): void {
    if (this.travelTimingContext) {
      this.travelTimingContext.records.update((records) => [record, ...records]);
      return;
    }
    this.travelLogStateService.addRecord(record);
  }

  private updateRecord(recordId: string, patch: Partial<TravelRecord>): boolean {
    if (this.travelTimingContext) {
      let didUpdate = false;
      this.travelTimingContext.records.update((records) =>
        records.map((record) => {
          if (record.id !== recordId) {
            return record;
          }
          didUpdate = true;
          return { ...record, ...patch };
        })
      );
      return didUpdate;
    }
    return this.travelLogStateService.updateRecord(recordId, patch);
  }

  private removeRecordFromState(recordId: string): void {
    if (this.travelTimingContext) {
      this.travelTimingContext.records.update((records) =>
        records.filter((record) => record.id !== recordId)
      );
      return;
    }
    this.travelLogStateService.removeRecord(recordId);
  }

  private resetForm(): void {
    this.form = {
      departDate: '',
      returnDate: '',
      destinationCountryCode: 'HK',
      tag: ''
    };
    this.dateRange = {
      start: null,
      end: null
    };
  }

  protected onDateRangeChange(boundary: DateRangeBoundary, date: Date | null): void {
    if (boundary === 'start') {
      this.dateRange.start = date;
      this.form.departDate = this.toIsoDate(date);
      return;
    }
    this.dateRange.end = date;
    this.form.returnDate = this.toIsoDate(date);
  }

  private toIsoDate(date: Date | null): string {
    if (!date) {
      return '';
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private fromIsoDate(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
      return null;
    }
    const [, yearText, monthText, dayText] = match;
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    const parsed = new Date(year, month - 1, day);
    if (
      parsed.getFullYear() !== year ||
      parsed.getMonth() !== month - 1 ||
      parsed.getDate() !== day
    ) {
      return null;
    }
    return parsed;
  }
}
