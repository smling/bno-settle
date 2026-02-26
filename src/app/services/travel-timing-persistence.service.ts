import { Injectable } from '@angular/core';
import { TravelRecord } from '../models/spec.models';
import { IlrTimelineEstimate } from './ilr-date-calculator.service';

type TravelTag = TravelRecord['tag'];

interface IndexedDbEntry {
  key: string;
  value: unknown;
}

export interface PersistedTravelTimingState {
  records: TravelRecord[];
  visaApprovedDate: string;
  estimate: IlrTimelineEstimate | null;
}

const DATABASE_NAME = 'bno-settle-local';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'app-state';
const TRAVEL_TIMING_STATE_KEY = 'travel-timing-state.v1';
const ALLOWED_TRAVEL_TAGS: TravelTag[] = ['holiday', 'work', 'family', 'other'];

@Injectable({
  providedIn: 'root'
})
export class TravelTimingPersistenceService {
  private databasePromise: Promise<IDBDatabase | null> | null = null;

  public async loadTravelTimingState(): Promise<PersistedTravelTimingState | null> {
    const value = await this.getValue(TRAVEL_TIMING_STATE_KEY);
    return this.parsePersistedTravelTimingState(value);
  }

  public async saveTravelTimingState(state: PersistedTravelTimingState): Promise<void> {
    await this.setValue(TRAVEL_TIMING_STATE_KEY, this.cloneState(state));
  }

  public async clearTravelTimingState(): Promise<void> {
    await this.deleteValue(TRAVEL_TIMING_STATE_KEY);
  }

  private async getDatabase(): Promise<IDBDatabase | null> {
    if (this.databasePromise !== null) {
      return this.databasePromise;
    }
    this.databasePromise = this.openDatabase();
    return this.databasePromise;
  }

  private openDatabase(): Promise<IDBDatabase | null> {
    if (typeof indexedDB === 'undefined') {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      try {
        const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
        request.onupgradeneeded = () => {
          const database = request.result;
          if (!database.objectStoreNames.contains(OBJECT_STORE_NAME)) {
            database.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'key' });
          }
        };
        request.onsuccess = () => {
          const database = request.result;
          database.onversionchange = () => {
            database.close();
          };
          resolve(database);
        };
        request.onerror = () => resolve(null);
        request.onblocked = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  private async getValue(key: string): Promise<unknown | null> {
    const database = await this.getDatabase();
    if (!database) {
      return null;
    }

    return new Promise((resolve) => {
      try {
        const transaction = database.transaction(OBJECT_STORE_NAME, 'readonly');
        const store = transaction.objectStore(OBJECT_STORE_NAME);
        const request = store.get(key);
        request.onsuccess = () => {
          const entry = request.result as IndexedDbEntry | undefined;
          resolve(entry?.value ?? null);
        };
        request.onerror = () => resolve(null);
        transaction.onabort = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  private async setValue(key: string, value: unknown): Promise<void> {
    const database = await this.getDatabase();
    if (!database) {
      return;
    }

    await new Promise<void>((resolve) => {
      try {
        const transaction = database.transaction(OBJECT_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(OBJECT_STORE_NAME);
        store.put({ key, value } satisfies IndexedDbEntry);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => resolve();
        transaction.onabort = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  private async deleteValue(key: string): Promise<void> {
    const database = await this.getDatabase();
    if (!database) {
      return;
    }

    await new Promise<void>((resolve) => {
      try {
        const transaction = database.transaction(OBJECT_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(OBJECT_STORE_NAME);
        store.delete(key);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => resolve();
        transaction.onabort = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  private parsePersistedTravelTimingState(value: unknown): PersistedTravelTimingState | null {
    if (!isRecord(value)) {
      return null;
    }
    const recordsValue = value['records'];
    const visaApprovedDate = value['visaApprovedDate'];
    const estimateValue = value['estimate'];
    if (!Array.isArray(recordsValue) || typeof visaApprovedDate !== 'string') {
      return null;
    }
    if (!isIsoDate(visaApprovedDate) && visaApprovedDate !== '') {
      return null;
    }

    const parsedRecords: TravelRecord[] = [];
    for (const candidate of recordsValue) {
      const parsedRecord = parseTravelRecord(candidate);
      if (!parsedRecord) {
        return null;
      }
      parsedRecords.push(parsedRecord);
    }

    const parsedEstimate = parseIlrTimelineEstimate(estimateValue);
    if (estimateValue !== null && !parsedEstimate) {
      return null;
    }

    return {
      records: parsedRecords,
      visaApprovedDate,
      estimate: parsedEstimate
    };
  }

  private cloneState(state: PersistedTravelTimingState): PersistedTravelTimingState {
    return {
      records: state.records.map((record) => ({ ...record })),
      visaApprovedDate: state.visaApprovedDate,
      estimate: state.estimate ? { ...state.estimate } : null
    };
  }
}

function parseTravelRecord(candidate: unknown): TravelRecord | null {
  if (!isRecord(candidate)) {
    return null;
  }
  const id = candidate['id'];
  const departDate = candidate['departDate'];
  const returnDate = candidate['returnDate'];
  const destinationCountryCode = candidate['destinationCountryCode'];
  const createdAt = candidate['createdAt'];
  const updatedAt = candidate['updatedAt'];
  const tag = candidate['tag'];

  if (
    typeof id !== 'string' ||
    !isIsoDate(departDate) ||
    !isIsoDate(returnDate) ||
    typeof destinationCountryCode !== 'string' ||
    typeof createdAt !== 'string' ||
    typeof updatedAt !== 'string'
  ) {
    return null;
  }

  if (tag !== undefined && !isTravelTag(tag)) {
    return null;
  }

  return {
    id,
    departDate,
    returnDate,
    destinationCountryCode,
    createdAt,
    updatedAt,
    tag
  };
}

function parseIlrTimelineEstimate(value: unknown): IlrTimelineEstimate | null {
  if (value === null) {
    return null;
  }
  if (!isRecord(value)) {
    return null;
  }
  const visaApprovedDate = value['visaApprovedDate'];
  const visaExpiryDate = value['visaExpiryDate'];
  const earliestIlrApplyDate = value['earliestIlrApplyDate'];

  if (
    !isIsoDate(visaApprovedDate) ||
    !isIsoDate(visaExpiryDate) ||
    !isIsoDate(earliestIlrApplyDate)
  ) {
    return null;
  }

  return {
    visaApprovedDate,
    visaExpiryDate,
    earliestIlrApplyDate
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isTravelTag(value: unknown): value is TravelTag {
  return typeof value === 'string' && ALLOWED_TRAVEL_TAGS.includes(value as TravelTag);
}
