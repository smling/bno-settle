import { Injectable } from '@angular/core';
import { ILR_REQUIRED_MONTHS } from '../policy/thresholds';

export interface IlrTimelineEstimate {
  visaApprovedDate: string;
  visaExpiryDate: string;
  earliestIlrApplyDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class IlrDateCalculatorService {
  public estimateFromVisaApprovedDate(visaApprovedDateIso: string): IlrTimelineEstimate | null {
    const visaApprovedDate = this.parseIsoDate(visaApprovedDateIso);
    if (!visaApprovedDate) {
      return null;
    }

    const visaExpiryDate = this.addMonths(visaApprovedDate, ILR_REQUIRED_MONTHS);
    const earliestIlrApplyDate = this.addDays(visaExpiryDate, -28);

    return {
      visaApprovedDate: this.toIsoDate(visaApprovedDate),
      visaExpiryDate: this.toIsoDate(visaExpiryDate),
      earliestIlrApplyDate: this.toIsoDate(earliestIlrApplyDate)
    };
  }

  private parseIsoDate(value: string): Date | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return null;
    }

    const [yearText, monthText, dayText] = value.split('-');
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);

    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
      return null;
    }

    const date = new Date(Date.UTC(year, month - 1, day));
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      return null;
    }

    return date;
  }

  private addMonths(date: Date, months: number): Date {
    const sourceYear = date.getUTCFullYear();
    const sourceMonth = date.getUTCMonth();
    const sourceDay = date.getUTCDate();

    const monthIndex = sourceMonth + months;
    const targetYear = sourceYear + Math.floor(monthIndex / 12);
    const targetMonth = ((monthIndex % 12) + 12) % 12;
    const maxDayInTargetMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
    const targetDay = Math.min(sourceDay, maxDayInTargetMonth);

    return new Date(Date.UTC(targetYear, targetMonth, targetDay));
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date.getTime());
    result.setUTCDate(result.getUTCDate() + days);
    return result;
  }

  private toIsoDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
