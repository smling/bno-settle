# BNO Settle IndexedDB Draft (C4 + Store Schema)

Source: `docs/functional-spec.md` (v2.1)

## 1) C4 Container Diagram

```mermaid
C4Container
title BNO Settle - Local Data Architecture (No Server Data)

Person(user, "User", "BN(O) visa applicant using offline PWA")
Container(pwa, "BNO Settle PWA", "Angular PWA", "Quick check, travel log, absence calculations, checklists, references")
ContainerDb(idb, "IndexedDB (bno_settle_v1)", "Browser local database", "Local-only storage; sensitive travel data encrypted at rest")
Container(sw, "Service Worker + App Shell", "PWA runtime", "Offline assets and app bootstrap")

Rel(user, pwa, "Uses in browser")
Rel(pwa, idb, "Read/Write local data")
Rel(sw, pwa, "Serves offline app assets")
Rel(user, idb, "Owns data on device only", "No server sync")
```

## 2) C4 Component Diagram (IndexedDB Object Stores)

```mermaid
C4Component
title IndexedDB Components (Object Stores)

Component(dataLayer, "Client Data Layer", "TypeScript module", "Validates input, encrypts/decrypts travel records, computes summaries")

Container_Boundary(idbBoundary, "IndexedDB: bno_settle_v1") {
  Component(vaultMeta, "vault_meta", "Object Store", "Encryption metadata only (no passphrase)")
  Component(travelRecords, "travel_records", "Object Store", "Encrypted trip payloads (ciphertext envelope)")
  Component(quickCheck, "quick_check_state", "Object Store", "Non-PII readiness inputs")
  Component(riskFlags, "risk_flag_answers", "Object Store", "yes/no/unsure risk answers")
  Component(checklists, "checklist_state", "Object Store", "ILR/Citizenship checklist completion")
  Component(absenceCache, "absence_summary_cache", "Object Store", "Derived totals/rolling peaks cache")
  Component(refRecent, "official_ref_recent", "Object Store", "Official reference lastAccessedAt by docId")
  Component(settings, "app_settings", "Object Store", "Retention, feature toggles, privacy options")
}

Rel(dataLayer, vaultMeta, "Read/Write")
Rel(dataLayer, travelRecords, "Read/Write (encrypted)")
Rel(dataLayer, quickCheck, "Read/Write")
Rel(dataLayer, riskFlags, "Read/Write")
Rel(dataLayer, checklists, "Read/Write")
Rel(dataLayer, absenceCache, "Read/Write")
Rel(dataLayer, refRecent, "Read/Write")
Rel(dataLayer, settings, "Read/Write")
Rel(travelRecords, absenceCache, "Source data for recalculation")
```

## 3) IndexedDB Store Structure

Database:
- `name`: `bno_settle_v1`
- `version`: `1`

| Object Store | Key Path | Indexes | Purpose | Core Fields |
|---|---|---|---|---|
| `vault_meta` | `id` | `by_updatedAt (updatedAt)` | Encryption setup/lock metadata | `id`, `schemaVersion`, `keyVersion`, `kdf:{algo,saltB64,iterations,hash}`, `encryptedDekB64`, `dekIvB64`, `isLocked`, `createdAt`, `updatedAt` |
| `travel_records` | `id` | `by_updatedAt (updatedAt)`, `by_expiresAt (expiresAt)` | Travel log records as ciphertext only | `id`, `ciphertextB64`, `ivB64`, `aadB64`, `keyVersion`, `createdAt`, `updatedAt`, `expiresAt?` |
| `quick_check_state` | `profileId` | `by_updatedAt (updatedAt)` | Non-binding check inputs (non-PII) | `profileId` (default `default`), `monthsInUK`, `ilrGranted`, `monthsSinceILR`, `marriedToBritishCitizen`, `lifeInUkPassed`, `englishB1MetOrExempt`, `updatedAt` |
| `risk_flag_answers` | `flagCode` | `by_status (status)`, `by_updatedAt (updatedAt)` | Risk questionnaire responses | `flagCode`, `status` (`yes`/`no`/`unsure`), `updatedAt` |
| `checklist_state` | `id` | `by_track (track)`, `by_track_status ([track,status])` | Checklist completion state | `id` (`<track>:<itemCode>`), `track` (`ilr`/`citizenship`), `itemCode`, `status` (`todo`/`done`/`na`), `updatedAt` |
| `absence_summary_cache` | `id` | `by_computedAt (computedAt)` | Cached derived absence summary | `id` (default `latest`), `sourceHash`, `daysOutsideLast12Months`, `maxDaysOutsideInAnyRolling12Months`, `daysOutsideLast5YearsTotal`, `rolling12MonthPeaks[]`, `byCountryLast12Months?`, `computedAt` |
| `official_ref_recent` | `docId` | `by_lastAccessedAt (lastAccessedAt)` | Local recent access metadata for official docs | `docId`, `lastAccessedAt` |
| `app_settings` | `key` | none | Local feature/privacy settings | `key`, `value`, `updatedAt` |

## 4) Security and Compliance Notes

- `travel_records` stores only ciphertext envelope fields. Plain `departDate`, `returnDate`, and `destinationCountryCode` are inside encrypted payload.
- No PII fields (name/address/ID numbers/free-text notes) are present in any object store.
- No server sync store exists by design. Data scope is device-local only.
- Retention cleanup should use `travel_records.by_expiresAt` and recompute `absence_summary_cache` after deletions.

