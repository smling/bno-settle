import { Component, EventEmitter, Injectable, Input, Output } from '@angular/core';
import { MatDateFormats, DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const YMD_SEPARATOR_PATTERN = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/;
const YMD_COMPACT_PATTERN = /^(\d{4})(\d{2})(\d{2})$/;

const ISO_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'input'
  },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' }
  }
};

function buildDate(year: number, month: number, day: number): Date | null {
  const date = new Date(year, month - 1, day);
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseUserDate(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (ISO_DATE_PATTERN.test(trimmed)) {
    const [yearText, monthText, dayText] = trimmed.split('-');
    return buildDate(Number(yearText), Number(monthText), Number(dayText));
  }

  const separatorMatch = trimmed.match(YMD_SEPARATOR_PATTERN);
  if (separatorMatch) {
    const [, yearText, monthText, dayText] = separatorMatch;
    return buildDate(Number(yearText), Number(monthText), Number(dayText));
  }

  const compactMatch = trimmed.match(YMD_COMPACT_PATTERN);
  if (compactMatch) {
    const [, yearText, monthText, dayText] = compactMatch;
    return buildDate(Number(yearText), Number(monthText), Number(dayText));
  }

  return null;
}

@Injectable()
class IsoDateAdapter extends NativeDateAdapter {
  override parse(value: unknown): Date | null {
    if (typeof value === 'string') {
      return parseUserDate(value);
    }
    return super.parse(value);
  }

  override deserialize(value: unknown): Date | null {
    if (typeof value === 'string') {
      return parseUserDate(value);
    }
    return super.deserialize(value);
  }

  override format(date: Date, displayFormat: object): string {
    if ((displayFormat as unknown as string) === 'input') {
      return toIsoDate(date);
    }
    return super.format(date, displayFormat);
  }
}

@Component({
  selector: 'app-date-input',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule],
  providers: [
    { provide: DateAdapter, useClass: IsoDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: ISO_DATE_FORMATS }
  ],
  template: `
    <mat-form-field appearance="outline" class="date-field">
      <mat-label>{{ label }}</mat-label>
      <input
        matInput
        [matDatepicker]="picker"
        [value]="rawInput"
        placeholder="yyyy-mm-dd"
        [required]="required"
        [disabled]="disabled"
        (input)="onRawInput($event)"
        (dateChange)="onDateChange($event.value)"
        (blur)="handleBlur()"
      />
      <mat-datepicker-toggle matIconSuffix [for]="picker" />
      <mat-datepicker #picker />
      <mat-hint>Format: yyyy-mm-dd</mat-hint>
    </mat-form-field>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .date-field {
        width: 100%;
      }
    `
  ]
})
export class DateInputComponent {
  @Input({ required: true }) label!: string;
  @Input() required = false;
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<string>();

  protected rawInput = '';
  private modelValue = '';

  constructor(private readonly dateAdapter: DateAdapter<Date>) {}

  @Input()
  set value(value: string | null | undefined) {
    const normalized = this.normalizeWithAdapter(value);
    this.modelValue = normalized;
    this.rawInput = normalized;
  }

  protected onRawInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.rawInput = input.value;
  }

  protected handleBlur(): void {
    const normalized = this.normalizeWithAdapter(this.rawInput);
    if (this.rawInput && !normalized) {
      this.rawInput = '';
      this.commitValue('');
      return;
    }
    this.rawInput = normalized;
    this.commitValue(normalized);
  }

  protected onDateChange(date: Date | null): void {
    if (!date) {
      return;
    }
    const normalized = this.dateAdapter.format(date, 'input');
    this.rawInput = normalized;
    this.commitValue(normalized);
  }

  private normalizeWithAdapter(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    const parsedDate = this.dateAdapter.parse(value, 'input');
    if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
      return '';
    }
    return this.dateAdapter.format(parsedDate, 'input');
  }

  private commitValue(value: string): void {
    if (value === this.modelValue) {
      return;
    }
    this.modelValue = value;
    this.valueChange.emit(value);
  }
}
