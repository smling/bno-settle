import {
  QuickCheckAssessment,
  QuickCheckInput,
  ReadinessAssessment,
  ReadinessLabel
} from '../../models/spec.models';
import {
  CIT_APPROACHING_RATIO,
  CITIZENSHIP_WAIT_MONTHS_AFTER_ILR,
  CIT_MAX_ABSENCE_5Y,
  CIT_MAX_ABSENCE_LAST_12M,
  ILR_MAX_ABSENCE_ROLLING_12M,
  ILR_REQUIRED_MONTHS
} from '../../policy/thresholds';

const severity: Record<ReadinessLabel, number> = {
  'Likely ready': 0,
  'Not yet': 1,
  'Potential issue': 2,
  'Needs review': 3
};

function escalateStatus(current: ReadinessLabel, next: ReadinessLabel): ReadinessLabel {
  return severity[next] > severity[current] ? next : current;
}

function createBaseAssessment(): ReadinessAssessment {
  return {
    status: 'Likely ready',
    reasons: [],
    missingChecklist: []
  };
}

function evaluateIlr(input: QuickCheckInput): ReadinessAssessment {
  const result = createBaseAssessment();
  const { state, absence } = input;

  if (state.monthsInUK < ILR_REQUIRED_MONTHS) {
    result.status = escalateStatus(result.status, 'Not yet');
    result.reasons.push(`Less than ${ILR_REQUIRED_MONTHS} months in UK.`);
  }

  if (absence.maxDaysOutsideInAnyRolling12Months > ILR_MAX_ABSENCE_ROLLING_12M) {
    result.status = escalateStatus(result.status, 'Potential issue');
    result.reasons.push(`Absences exceed ${ILR_MAX_ABSENCE_ROLLING_12M} days in a rolling 12-month window.`);
  }

  if (!state.lifeInUkPassed) {
    result.missingChecklist.push('Life in the UK test');
  }

  if (!state.englishB1MetOrExempt) {
    result.missingChecklist.push('English B1 or exemption evidence');
  }

  return result;
}

function evaluateCitizenship(input: QuickCheckInput): ReadinessAssessment {
  const result = createBaseAssessment();
  const { state, absence, riskFlags } = input;
  const abs5yWarningThreshold = Math.floor(CIT_MAX_ABSENCE_5Y * CIT_APPROACHING_RATIO);
  const abs12mWarningThreshold = Math.floor(CIT_MAX_ABSENCE_LAST_12M * CIT_APPROACHING_RATIO);

  if (!state.ilrGranted) {
    result.status = escalateStatus(result.status, 'Not yet');
    result.reasons.push('ILR not granted yet.');
  }

  if (!state.marriedToBritishCitizen && state.monthsSinceILR < CITIZENSHIP_WAIT_MONTHS_AFTER_ILR) {
    result.status = escalateStatus(result.status, 'Not yet');
    result.reasons.push(
      `Needs ${CITIZENSHIP_WAIT_MONTHS_AFTER_ILR} months after ILR unless married to a British citizen.`
    );
  }

  if (absence.daysOutsideLast5YearsTotal >= abs5yWarningThreshold) {
    result.status = escalateStatus(result.status, 'Potential issue');
    result.reasons.push(`5-year absences are approaching/exceeding ${CIT_MAX_ABSENCE_5Y} days.`);
  }

  if (absence.daysOutsideLast12Months >= abs12mWarningThreshold) {
    result.status = escalateStatus(result.status, 'Potential issue');
    result.reasons.push(`Last 12-month absences are approaching/exceeding ${CIT_MAX_ABSENCE_LAST_12M} days.`);
  }

  if (riskFlags.some((answer) => answer === 'yes' || answer === 'unsure')) {
    result.status = escalateStatus(result.status, 'Needs review');
    result.reasons.push('At least one risk flag is yes/unsure.');
  }

  return result;
}

export function evaluateQuickCheck(input: QuickCheckInput): QuickCheckAssessment {
  return {
    ilr: evaluateIlr(input),
    citizenship: evaluateCitizenship(input)
  };
}
