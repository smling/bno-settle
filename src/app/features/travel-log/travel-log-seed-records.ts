import { TravelRecord } from '../../models/spec.models';

export const SEED_TRAVEL_RECORDS: TravelRecord[] = [
  {
    id: 'trip_1',
    departDate: '2025-06-01',
    returnDate: '2025-06-12',
    destinationCountryCode: 'JP',
    tag: 'holiday',
    createdAt: '2025-05-20T10:10:00.000Z',
    updatedAt: '2025-05-20T10:10:00.000Z'
  },
  {
    id: 'trip_2',
    departDate: '2025-11-15',
    returnDate: '2025-11-22',
    destinationCountryCode: 'FR',
    tag: 'work',
    createdAt: '2025-10-01T08:30:00.000Z',
    updatedAt: '2025-10-01T08:30:00.000Z'
  }
];
