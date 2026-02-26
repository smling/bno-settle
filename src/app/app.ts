import { Component, effect, inject, signal } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { AbsenceSummaryScreenComponent } from './features/absence-summary/absence-summary-screen.component';
import { ChecklistsScreenComponent } from './features/checklists/checklists-screen.component';
import { IlrDateEstimatorComponent } from './features/ilr-date-estimator/ilr-date-estimator.component';
import { OfficialReferencesScreenComponent } from './features/official-references/official-references-screen.component';
import { PrivacyDebugScreenComponent } from './features/privacy-debug/privacy-debug-screen.component';
import { QuickCheckScreenComponent } from './features/quick-check/quick-check-screen.component';
import { RiskFlagsScreenComponent } from './features/risk-flags/risk-flags-screen.component';
import { SettingsScreenComponent } from './features/settings/settings-screen.component';
import { TravelLogScreenComponent } from './features/travel-log/travel-log-screen.component';
import { SEED_TRAVEL_RECORDS } from './features/travel-log/travel-log-seed-records';
import { I18nService } from './i18n/i18n.service';

import { DisclaimerBannerComponent } from './shared/disclaimer-banner/disclaimer-banner.component';
import { TravelTimingContext } from './models/travel-timing-context.model';
import {
  PersistedTravelTimingState,
  TravelTimingPersistenceService
} from './services/travel-timing-persistence.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatTabsModule,
    DisclaimerBannerComponent,
    IlrDateEstimatorComponent,
    QuickCheckScreenComponent,
    TravelLogScreenComponent,
    AbsenceSummaryScreenComponent,
    ChecklistsScreenComponent,
    RiskFlagsScreenComponent,
    OfficialReferencesScreenComponent,
    SettingsScreenComponent,
    PrivacyDebugScreenComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly i18n = inject(I18nService);
  private readonly travelTimingPersistenceService = inject(TravelTimingPersistenceService);
  private readonly hasHydratedTravelTimingState = signal(false);
  protected readonly travelTimingContext = new TravelTimingContext(
    SEED_TRAVEL_RECORDS.map((record) => ({ ...record }))
  );

  constructor() {
    void this.hydrateTravelTimingState();

    effect(() => {
      if (!this.hasHydratedTravelTimingState()) {
        return;
      }
      const state: PersistedTravelTimingState = {
        records: this.travelTimingContext.records().map((record) => ({ ...record })),
        visaApprovedDate: this.travelTimingContext.visaApprovedDate(),
        arrivedUkDate: this.travelTimingContext.arrivedUkDate(),
        estimate: this.cloneEstimate(this.travelTimingContext.estimate())
      };
      void this.travelTimingPersistenceService.saveTravelTimingState(state);
    });
  }

  private async hydrateTravelTimingState(): Promise<void> {
    try {
      const persisted = await this.travelTimingPersistenceService.loadTravelTimingState();
      if (!persisted) {
        return;
      }
      this.travelTimingContext.records.set(persisted.records.map((record) => ({ ...record })));
      this.travelTimingContext.visaApprovedDate.set(persisted.visaApprovedDate);
      this.travelTimingContext.arrivedUkDate.set(persisted.arrivedUkDate);
      this.travelTimingContext.estimate.set(this.cloneEstimate(persisted.estimate));
    } finally {
      this.hasHydratedTravelTimingState.set(true);
    }
  }

  private cloneEstimate(
    estimate: PersistedTravelTimingState['estimate']
  ): PersistedTravelTimingState['estimate'] {
    if (!estimate) {
      return null;
    }
    return { ...estimate };
  }
}
