import { Component, signal } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { AbsenceSummaryScreenComponent } from './features/absence-summary/absence-summary-screen.component';
import { ChecklistsScreenComponent } from './features/checklists/checklists-screen.component';
import { IlrDateEstimatorComponent } from './features/ilr-date-estimator/ilr-date-estimator.component';
import { OfficialReferencesScreenComponent } from './features/official-references/official-references-screen.component';
import { OnboardingScreenComponent } from './features/onboarding/onboarding-screen.component';
import { PrivacyDebugScreenComponent } from './features/privacy-debug/privacy-debug-screen.component';
import { QuickCheckScreenComponent } from './features/quick-check/quick-check-screen.component';
import { RiskFlagsScreenComponent } from './features/risk-flags/risk-flags-screen.component';
import { SettingsScreenComponent } from './features/settings/settings-screen.component';
import { TimelineScreenComponent } from './features/timeline/timeline-screen.component';
import { TravelLogScreenComponent } from './features/travel-log/travel-log-screen.component';
import { SEED_TRAVEL_RECORDS } from './features/travel-log/travel-log-seed-records';
import { TravelTimingContext } from './models/travel-timing-context.model';
import { DisclaimerBannerComponent } from './shared/disclaimer-banner/disclaimer-banner.component';


@Component({
  selector: 'app-root',
  imports: [
    MatTabsModule,
    DisclaimerBannerComponent,
    OnboardingScreenComponent,
    IlrDateEstimatorComponent,
    QuickCheckScreenComponent,
    TravelLogScreenComponent,
    AbsenceSummaryScreenComponent,
    ChecklistsScreenComponent,
    TimelineScreenComponent,
    RiskFlagsScreenComponent,
    OfficialReferencesScreenComponent,
    SettingsScreenComponent,
    PrivacyDebugScreenComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('BNO Settle');
  protected readonly travelTimingContext = new TravelTimingContext(SEED_TRAVEL_RECORDS);
}
