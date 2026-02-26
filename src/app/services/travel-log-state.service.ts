import { Injectable, Signal, signal } from '@angular/core';
import { TravelRecord } from '../models/spec.models';
import { SEED_TRAVEL_RECORDS } from '../features/travel-log/travel-log-seed-records';

@Injectable({
  providedIn: 'root'
})
export class TravelLogStateService {
  private readonly recordsState = signal<TravelRecord[]>(
    SEED_TRAVEL_RECORDS.map((record) => ({ ...record }))
  );

  public readonly records: Signal<TravelRecord[]> = this.recordsState.asReadonly();

  public addRecord(record: TravelRecord): void {
    this.recordsState.update((records) => [record, ...records]);
  }

  public updateRecord(recordId: string, patch: Partial<TravelRecord>): boolean {
    let didUpdate = false;
    this.recordsState.update((records) =>
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

  public removeRecord(recordId: string): void {
    this.recordsState.update((records) => records.filter((record) => record.id !== recordId));
  }
}
