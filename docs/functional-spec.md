# BNO Settle — Functional Spec v2.1
Privacy-first BN(O) ILR & Citizenship Helper (PWA)

A Progressive Web App for Hong Kong **BN(O) visa** users to track **general readiness** for:
- **ILR (settlement)** under the BN(O) route
- **British citizenship (naturalisation)** after ILR

**Key design principle:** privacy-by-design with **no server data**, no accounts, and minimised data collection.  
**Disclaimer:** informational tool only; **not legal advice**.

---

## 1) Scope

### In-scope features
1. **Quick Check**: non-binding readiness guidance for ILR and citizenship using user-entered data.
2. **Travel Log**: log exact trips (depart/return dates) and **destination country (code)** to help prepare application records.
3. **Absence Calculator**: compute absence totals and rolling-window peaks from travel log.
4. **Checklists**: document-type checklists (no uploads) for ILR and citizenship preparation.
5. **Timeline**: month-based milestone view (optionally day-level display).
6. **Risk Flags**: yes/no/unsure questionnaire to show “needs review” banner.
7. **Official References**: in-app catalog of official guidance links; store last access time locally.

### Non-goals
- No legal advice / representation
- No “guaranteed eligible” decisions
- No Home Office form filling or submission
- No accounts, no cloud sync, no server-side profiles
- No document scanning/uploading

---

## 2) Outputs & Labels (must be non-binding)

Use only:
- `Likely ready`
- `Not yet`
- `Potential issue`
- `Needs review`

Never display:
- “Approved”, “Eligible”, “Guaranteed”, “Will be granted”

All result screens must include:
- “General information only — not legal advice.”
- “Rules change. Verify on official GOV.UK.”
- “Complex cases may need regulated professional advice.”

---

## 3) Data minimisation & PII rules

### 3.1 PII banned fields (MUST NOT collect/store)
- Name, address, email, phone
- Passport / BRP / eVisa / NI numbers or references
- Document images (passport/BRP/bills/bank statements)
- Free-text notes that could contain identifiers (see remarks policy)

### 3.2 Allowed data (minimised)
- Counts and booleans (months in UK, absence days, flags)
- Exact travel dates (sensitive) **stored locally only**
- Destination **country code** only (controlled list) to avoid free-text identifiers
- Official reference access metadata (docId + timestamp)

### 3.3 Remarks policy (avoid “touching the wire” risk)
- Default: **NO free-text** anywhere.
- If remarks are introduced later:
  - optional, encrypted, local-only
  - must include PII warnings + basic pattern detection
  - must NOT be exported by default
  - must never appear in logs/analytics/crash reports

---

## 4) Travel Log (destination country via ISO code)

### 4.1 Travel record fields (local-only)
`TravelRecord` MUST contain:
- `id: string` (uuid)
- `departDate: string` (YYYY-MM-DD)
- `returnDate: string` (YYYY-MM-DD)
- `destinationCountryCode: string` (ISO 3166-1 alpha-2, e.g., `JP`, `HK`, `FR`) **REQUIRED**
- `tag?: "holiday" | "work" | "family" | "other"` (enum only)
- `createdAt: string` (ISO)
- `updatedAt: string` (ISO)

### 4.2 Destination country requirements
- Country selection must use an **offline, bundled list** of ISO codes + display names
- No user-defined country text
- Do NOT collect city, address, airline, flight number, hotel, companion names, or employer names

### 4.3 Calculations generated from travel log
`ComputedAbsenceSummary`:
- `daysOutsideLast12Months: number`
- `maxDaysOutsideInAnyRolling12Months: number`
- `daysOutsideLast5YearsTotal: number`
- `rolling12MonthPeaks: Array<{ start: string; end: string; daysOutside: number }>`
- (optional) `byCountryLast12Months?: { [countryCode: string]: number }` (derived)

---

## 5) Guidance rules (configurable constants)

### 5.1 ILR (BN(O) route) guidance checks
- If `monthsInUK < 60` → `Not yet`
- If `maxDaysOutsideInAnyRolling12Months > 180` → `Potential issue (absences)`
- If `Life in the UK` not passed → checklist item missing
- If `English B1 / exemption` not met → checklist item missing
- Show reminder: earliest application is typically up to ~28 days early (link official reference)

### 5.2 Citizenship (naturalisation) guidance checks
- If `ilrGranted == false` → `Not yet`
- If `marriedToBritishCitizen == false` and `monthsSinceILR < 12` → `Not yet`
- If `daysOutsideLast5YearsTotal` approaches/exceeds **450** → `Potential issue`
- If `daysOutsideLast12Months` approaches/exceeds **90** → `Potential issue`
- Any risk flag `yes/unsure` → `Needs review`

### 5.3 Policy constants file (recommended)
All thresholds MUST be defined in a local config file (no remote fetch), e.g.:
- `ILR_REQUIRED_MONTHS = 60`
- `ILR_MAX_ABSENCE_ROLLING_12M = 180`
- `CITIZENSHIP_WAIT_MONTHS_AFTER_ILR = 12`
- `CIT_MAX_ABSENCE_5Y = 450`
- `CIT_MAX_ABSENCE_LAST_12M = 90`

---

## 6) Official References (catalog + last access)

### 6.1 Catalog
Built-in whitelist only:
- `docId`
- `name`
- `url`

### 6.2 Recently accessed
Stored locally only:
- `recent[docId].lastAccessedAt` (ISO timestamp)

### 6.3 Constraints
- User cannot add custom URLs or names
- Opening official URLs must be explicit user action (button click)
- No prefetching

---

## 7) Storage & networking (HARD REQUIREMENT: no server data)

### 7.1 No server data (MUST)
The app MUST NOT send user data to any server. This includes:
- analytics
- crash reporting
- remote logging
- third-party trackers
- sync/backups
- “phone home” checks

### 7.2 Allowed network activity
- Only **user-initiated navigation** to official reference links (e.g., GOV.UK) is allowed.
- The app must not attach user data to URLs, headers, or referrers.

### 7.3 CSP + packaging requirements (compliance enforcement)
MUST implement strict CSP, e.g.:
- `default-src 'self'`
- `connect-src 'none'`
- `script-src 'self'`
- `style-src 'self'`
- `img-src 'self' data:`
- `font-src 'self'`
- `frame-ancestors 'none'`

MUST:
- Bundle all JS/CSS/fonts/icons locally (no CDN)
- Avoid any dependency that performs background network calls
- Provide a CI “privacy build check” step that fails if forbidden packages (analytics SDKs) are detected

---

## 8) Encryption requirements (local-only, sensitive travel data)

Because travel dates + destination country may be personal data:
- If Travel Log is enabled, storage MUST be **encrypted at rest locally**:
  - IndexedDB stores ciphertext only
  - WebCrypto AES-GCM
  - Key derived from user passphrase (PBKDF2)
- Provide:
  - Set/Change passphrase
  - Lock/Unlock vault
  - Wipe vault

If user refuses passphrase:
- Choose one and document it:
  - (A) disallow travel log, OR
  - (B) allow travel log with a persistent warning banner

---

## 9) Export policy (local-only)

- Export must be **local file only** (download JSON/CSV)
- Default export includes:
  - Absence summaries
  - Trip list (dates + country code)
- Export must NOT include:
  - any PII fields (none exist by spec)
- Show warning:
  - “Exported files may contain personal data. Store securely.”

---

## 10) UI / Screens

1. Onboarding (privacy notice + disclaimers)
2. Quick Check (ILR + Citizenship)
3. Travel Log (add/edit trips; country picker)
4. Absence Summary (computed totals + rolling peaks)
5. Checklists (ILR / Citizenship)
6. Timeline (Month/Year default; optional exact dates)
7. Risk Flags
8. Official References (catalog + recent)
9. Settings
   - Travel Log enable/disable
   - Encryption (passphrase, lock/unlock)
   - Retention (auto-expiry)
   - Export
   - Clear travel log
   - Clear all data
10. Privacy / Debug (compliance evidence)
   - Show CSP policy text (static)
   - Show “network requests this session” counter (best effort)
   - Show “no analytics / no remote logging” statement

---

## 11) GDPR / UK Data Protection posture (must be covered)

### 11.1 Data protection scope
- The app may process **personal data locally on the user’s device** (e.g., travel dates + destination country code).
- The design intentionally avoids server-side processing.

### 11.2 Practical controller/processor posture
- No accounts, no server storage, no sync.
- The app does not transmit user-entered data to the developer/operator.
- User retains control of their on-device data (export/wipe).

### 11.3 Transparency
- Onboarding + Settings MUST state:
  - what data is stored
  - where it is stored (device only)
  - retention/expiry
  - how to delete/export

### 11.4 Data minimisation & purpose limitation
- Collect only what is needed for absence calculations and preparation.
- Controlled inputs (ISO country codes, enums). No free text by default.

### 11.5 Security (integrity & confidentiality)
- Local encryption for travel log data at rest.
- No analytics/crash reporting/remote logs/trackers.
- Strict CSP preventing background network connections.

### 11.6 Storage limitation
- Retention setting + auto-expiry.
- One-tap wipe for all local data.

### 11.7 Data subject rights (practical handling)
Local-only design supports:
- Access/portability: local export JSON/CSV
- Rectification: edit records
- Erasure: clear travel log / clear all

### 11.8 Change control
If future features add any server processing (accounts, sync, telemetry), you MUST revisit:
- lawful basis, transparency wording
- security model
- DPIA need, DSAR handling, and vendor/processor contracts

---

## 12) Suggested repo artifacts

- `docs/functional-spec.md` (this file)
- `docs/privacy-notice.md` (plain-language, user-facing)
- `docs/compliance-checklist.md` (engineering + QA)
- `policy/thresholds.json`
- `policy/official-references.json`
- optional: `scripts/privacy-audit.sh` (static checks)

---

## Disclaimer
This project is informational tooling only and does not provide legal advice.
Users must verify requirements using official sources and consider professional advice for complex cases.