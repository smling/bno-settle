# 🧭 BNO Settle

Private-first helper for BN(O) ILR + citizenship planning.

> ⚠️ General information only. This app is not legal advice. Always verify with official GOV.UK guidance.

## ✨ Current Features

### 🧭 Assessment
- ⚡ Quick Check for ILR and citizenship readiness labels.
- 🚩 Risk Flags (yes/no/unsure prompts) for review-heavy situations.

### ✈️ Timing
- 🧮 ILR date estimator from visa approved date (and optional arrived-UK date).
- 🛫 Travel log with departure/return dates, destination country, and travel tags.
- 📊 Absence summary with rolling 12-month peaks, 12-month/5-year totals, yearly breakdown, and country summary.

### 📄 Docs
- ✅ ILR and citizenship preparation checklists.
- 🏛️ Official GOV.UK reference links.

### 🔒 Settings / Privacy
- 🌐 Language switch (`English` / `Traditional Chinese`).
- 🛡️ Privacy-debug summary (CSP/network/telemetry notes).
- 💾 Local-first persistence for travel timing data (IndexedDB).

## 🧱 Tech Stack
- Angular 21 (standalone components)
- Angular Material
- D3.js (charts)
- Vitest (unit tests)
- GitHub Actions (CI + CD)

## 🚀 Local Development

### Prerequisites
- Node.js 22 LTS recommended
- npm (project uses `npm@11.x`)

### Install
```bash
npm ci
```

### Start dev server
```bash
npm start
```
Open `http://localhost:4200/`.

### Run tests
```bash
npm test -- --watch=false
```

### Build production
```bash
npm run build -- --configuration production
```

## 🔍 CI / CD

### ✅ CI (`push`)
- Unit tests + coverage report
- Dependency vulnerability check (`npm audit`)
- SAST scan (Semgrep)
- Sensitive data scan (Gitleaks)
- Audit artifacts retained in GitHub Actions

### 🚢 CD (`push` to `main`)
- Build and package production app
- Deploy to GitHub Pages
- Create git tag
- Create GitHub Release with packaged artifact

## 🤝 Contributing

### 1. Raise a GitHub Issue
- Use Issues for bugs, feature requests, and improvements.
- Include a clear title, expected vs actual behavior, reproduction steps (for bugs), and screenshots/logs when useful.

### 2. Submit a Pull Request
1. Fork or branch from `main`.
2. Implement your change in small, focused commits.
3. Add or update unit tests.
4. Run checks locally:
```bash
npm ci
npm test -- --watch=false
npm run build -- --configuration production
```
5. Open a PR and link the related issue (for example: `Closes #123`).
6. Ensure CI is green before requesting review.

### ✅ PR Checklist
- Tests added/updated for behavior changes.
- No secrets or sensitive data committed.
- Docs updated when user-facing behavior changed.
- Budget/performance impact considered for bundle-size changes.

## 📄 License

See [LICENSE.md](./LICENSE.md).
