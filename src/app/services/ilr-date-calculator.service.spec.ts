import { TestBed } from '@angular/core/testing';
import { IlrDateCalculatorService } from './ilr-date-calculator.service';

describe('IlrDateCalculatorService', () => {
  let service: IlrDateCalculatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IlrDateCalculatorService);
  });

  it('should calculate visa expiry and earliest ILR date from visa approved date', () => {
    const result = service.estimateFromVisaApprovedDate('2024-03-01');
    expect(result).toEqual({
      visaApprovedDate: '2024-03-01',
      visaExpiryDate: '2029-03-01',
      earliestIlrApplyDate: '2029-02-01'
    });
  });

  it('should clamp leap day approved date to valid target month day', () => {
    const result = service.estimateFromVisaApprovedDate('2024-02-29');
    expect(result).toEqual({
      visaApprovedDate: '2024-02-29',
      visaExpiryDate: '2029-02-28',
      earliestIlrApplyDate: '2029-01-31'
    });
  });

  it('should return null for invalid date input', () => {
    expect(service.estimateFromVisaApprovedDate('2024-02-30')).toBeNull();
    expect(service.estimateFromVisaApprovedDate('not-a-date')).toBeNull();
  });
});
