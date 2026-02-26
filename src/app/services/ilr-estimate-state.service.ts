import { Injectable, Signal, signal } from '@angular/core';
import { IlrTimelineEstimate } from './ilr-date-calculator.service';

@Injectable({
  providedIn: 'root'
})
export class IlrEstimateStateService {
  private readonly visaApprovedDateState = signal('');
  private readonly arrivedUkDateState = signal('');
  private readonly estimateState = signal<IlrTimelineEstimate | null>(null);

  public readonly visaApprovedDate: Signal<string> = this.visaApprovedDateState.asReadonly();
  public readonly arrivedUkDate: Signal<string> = this.arrivedUkDateState.asReadonly();
  public readonly estimate: Signal<IlrTimelineEstimate | null> = this.estimateState.asReadonly();

  public setEstimate(visaApprovedDate: string, estimate: IlrTimelineEstimate | null): void {
    this.visaApprovedDateState.set(visaApprovedDate);
    this.estimateState.set(estimate);
  }

  public setArrivedUkDate(arrivedUkDate: string): void {
    this.arrivedUkDateState.set(arrivedUkDate);
  }
}
