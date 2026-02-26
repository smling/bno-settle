export type ReadinessLabel = 'Likely ready' | 'Not yet' | 'Potential issue' | 'Needs review';

export type RiskAnswer = 'yes' | 'no' | 'unsure';

export interface LocalizedMessage {
  key: string;
  params?: Record<string, string | number>;
}

export interface TravelRecord {
  id: string;
  departDate: string;
  returnDate: string;
  destinationCountryCode: string;
  tag?: 'holiday' | 'work' | 'family' | 'other';
  createdAt: string;
  updatedAt: string;
}

export interface ComputedAbsenceSummary {
  daysOutsideLast12Months: number;
  maxDaysOutsideInAnyRolling12Months: number;
  daysOutsideLast5YearsTotal: number;
  rolling12MonthPeaks: Array<{ start: string; end: string; daysOutside: number }>;
  byCountryLast12Months?: Record<string, number>;
}

export interface QuickCheckState {
  monthsInUK: number;
  ilrGranted: boolean;
  monthsSinceILR: number;
  marriedToBritishCitizen: boolean;
  lifeInUkPassed: boolean;
  englishB1MetOrExempt: boolean;
}

export interface QuickCheckInput {
  state: QuickCheckState;
  absence: ComputedAbsenceSummary;
  riskFlags: RiskAnswer[];
}

export interface ReadinessAssessment {
  status: ReadinessLabel;
  reasons: LocalizedMessage[];
  missingChecklist: LocalizedMessage[];
}

export interface QuickCheckAssessment {
  ilr: ReadinessAssessment;
  citizenship: ReadinessAssessment;
}
