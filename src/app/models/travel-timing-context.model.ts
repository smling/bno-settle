import { signal, WritableSignal } from '@angular/core';
import { IlrTimelineEstimate } from '../services/ilr-date-calculator.service';
import { TravelRecord } from './spec.models';

export class TravelTimingContext {
  public readonly records: WritableSignal<TravelRecord[]>;
  public readonly visaApprovedDate: WritableSignal<string>;
  public readonly arrivedUkDate: WritableSignal<string>;
  public readonly estimate: WritableSignal<IlrTimelineEstimate | null>;

  constructor(
    initialRecords: TravelRecord[] = [],
    initialVisaApprovedDate = '',
    initialArrivedUkDate = '',
    initialEstimate: IlrTimelineEstimate | null = null
  ) {
    this.records = signal(initialRecords.map((record) => ({ ...record })));
    this.visaApprovedDate = signal(initialVisaApprovedDate);
    this.arrivedUkDate = signal(initialArrivedUkDate);
    this.estimate = signal(initialEstimate);
  }
}
