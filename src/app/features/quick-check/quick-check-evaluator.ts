import {
  LocalizedMessage,
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

function message(key: string, params?: Record<string, string | number>): LocalizedMessage {
  return { key, params };
}

function evaluateIlr(input: QuickCheckInput): ReadinessAssessment {
  const result = createBaseAssessment();
  const { state, absence } = input;

  if (state.monthsInUK < ILR_REQUIRED_MONTHS) {
    result.status = escalateStatus(result.status, 'Not yet');
    result.reasons.push(
      message('quickCheck.reason.ilr.lessThanMonths', { months: ILR_REQUIRED_MONTHS })
    );
  }

  if (absence.maxDaysOutsideInAnyRolling12Months > ILR_MAX_ABSENCE_ROLLING_12M) {
    result.status = escalateStatus(result.status, 'Potential issue');
    result.reasons.push(
      message('quickCheck.reason.ilr.absenceExceeded', { days: ILR_MAX_ABSENCE_ROLLING_12M })
    );
  }

  if (!state.lifeInUkPassed) {
    result.missingChecklist.push(message('quickCheck.missing.lifeInUk'));
  }

  if (!state.englishB1MetOrExempt) {
    result.missingChecklist.push(message('quickCheck.missing.englishB1'));
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
    result.reasons.push(message('quickCheck.reason.citizenship.ilrNotGranted'));
  }

  if (!state.marriedToBritishCitizen && state.monthsSinceILR < CITIZENSHIP_WAIT_MONTHS_AFTER_ILR) {
    result.status = escalateStatus(result.status, 'Not yet');
    result.reasons.push(
      message('quickCheck.reason.citizenship.waitAfterIlr', {
        months: CITIZENSHIP_WAIT_MONTHS_AFTER_ILR
      })
    );
  }

  if (absence.daysOutsideLast5YearsTotal >= abs5yWarningThreshold) {
    result.status = escalateStatus(result.status, 'Potential issue');
    result.reasons.push(
      message('quickCheck.reason.citizenship.absence5y', { days: CIT_MAX_ABSENCE_5Y })
    );
  }

  if (absence.daysOutsideLast12Months >= abs12mWarningThreshold) {
    result.status = escalateStatus(result.status, 'Potential issue');
    result.reasons.push(
      message('quickCheck.reason.citizenship.absence12m', { days: CIT_MAX_ABSENCE_LAST_12M })
    );
  }

  if (riskFlags.some((answer) => answer === 'yes' || answer === 'unsure')) {
    result.status = escalateStatus(result.status, 'Needs review');
    result.reasons.push(message('quickCheck.reason.citizenship.riskFlag'));
  }

  return result;
}

export function evaluateQuickCheck(input: QuickCheckInput): QuickCheckAssessment {
  return {
    ilr: evaluateIlr(input),
    citizenship: evaluateCitizenship(input)
  };
}
