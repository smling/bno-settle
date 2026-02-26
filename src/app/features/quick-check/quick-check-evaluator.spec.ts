import { evaluateQuickCheck } from './quick-check-evaluator';

describe('evaluateQuickCheck', () => {
  it('returns likely ready when all checks are satisfied', () => {
    const result = evaluateQuickCheck({
      state: {
        monthsInUK: 62,
        ilrGranted: true,
        monthsSinceILR: 14,
        marriedToBritishCitizen: false,
        lifeInUkPassed: true,
        englishB1MetOrExempt: true
      },
      absence: {
        daysOutsideLast12Months: 40,
        maxDaysOutsideInAnyRolling12Months: 90,
        daysOutsideLast5YearsTotal: 210,
        rolling12MonthPeaks: []
      },
      riskFlags: ['no', 'no']
    });

    expect(result.ilr.status).toBe('Likely ready');
    expect(result.citizenship.status).toBe('Likely ready');
    expect(result.ilr.missingChecklist).toEqual([]);
  });

  it('returns not yet for ILR when months in UK are below threshold', () => {
    const result = evaluateQuickCheck({
      state: {
        monthsInUK: 30,
        ilrGranted: false,
        monthsSinceILR: 0,
        marriedToBritishCitizen: false,
        lifeInUkPassed: false,
        englishB1MetOrExempt: false
      },
      absence: {
        daysOutsideLast12Months: 20,
        maxDaysOutsideInAnyRolling12Months: 20,
        daysOutsideLast5YearsTotal: 80,
        rolling12MonthPeaks: []
      },
      riskFlags: ['no']
    });

    expect(result.ilr.status).toBe('Not yet');
    expect(result.ilr.reasons).toContain('Less than 60 months in UK.');
    expect(result.ilr.missingChecklist.length).toBe(2);
  });

  it('returns needs review for citizenship when risk flags include unsure or yes', () => {
    const result = evaluateQuickCheck({
      state: {
        monthsInUK: 70,
        ilrGranted: true,
        monthsSinceILR: 16,
        marriedToBritishCitizen: false,
        lifeInUkPassed: true,
        englishB1MetOrExempt: true
      },
      absence: {
        daysOutsideLast12Months: 85,
        maxDaysOutsideInAnyRolling12Months: 85,
        daysOutsideLast5YearsTotal: 300,
        rolling12MonthPeaks: []
      },
      riskFlags: ['no', 'unsure']
    });

    expect(result.citizenship.status).toBe('Needs review');
    expect(result.citizenship.reasons).toContain('At least one risk flag is yes/unsure.');
  });

  it('flags potential issue when citizenship absences approach thresholds', () => {
    const result = evaluateQuickCheck({
      state: {
        monthsInUK: 80,
        ilrGranted: true,
        monthsSinceILR: 20,
        marriedToBritishCitizen: false,
        lifeInUkPassed: true,
        englishB1MetOrExempt: true
      },
      absence: {
        daysOutsideLast12Months: 82,
        maxDaysOutsideInAnyRolling12Months: 110,
        daysOutsideLast5YearsTotal: 420,
        rolling12MonthPeaks: []
      },
      riskFlags: ['no']
    });

    expect(result.citizenship.status).toBe('Potential issue');
    expect(result.citizenship.reasons[0]).toContain('5-year absences');
  });
});
