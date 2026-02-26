## Engineering Standards

### Coding Practices
- Keep components small, focused, and reusable.
- Prefer composition over large monolithic screens.
- Use clear naming and avoid duplicate business logic.
- Keep all date values and persisted date strings in ISO 8601 (`YYYY-MM-DD`).
- Follow existing Angular patterns in this repo (standalone components, signals, and service-based state where applicable).

### UI / UX Practices
- Ensure mobile and desktop friendly layouts.
- Minimize unnecessary scrolling and long single-page sections.
- Use tab or panel grouping for complex sections.
- Keep visual style consistent with existing app typography and spacing.
- Maintain accessibility basics: semantic HTML, keyboard access, and clear labels.

### Testing Standards
- Add or update unit tests for every functional code change.
- Prioritize tests for business logic, state transitions, and edge cases.
- Keep tests deterministic and independent.
- Maintain coverage outputs so CI artifacts remain auditable.

### Security and Quality Gates
- Do not commit secrets, tokens, or sensitive personal data.
- Keep dependencies up to date and resolve audit findings promptly.
- Treat SAST and sensitive-data scan findings as release blockers unless explicitly triaged.

### CI / CD Expectations
CI (on every push):
- Run unit tests with coverage report.
- Run dependency vulnerability check.
- Run SAST scan.
- Run sensitive data scan.
- Retain all reports as artifacts for audit.

CD (on push to `main`):
- Build and package production app.
- Deploy to GitHub Pages.
- Create git tag and GitHub Release with build artifact.

### Performance and Build Budgets
- Respect Angular build budgets to prevent uncontrolled bundle growth.
- If budget limits are adjusted, document the reason in the related PR.
- Prefer optimization and lazy-loading before increasing `maximumError` thresholds.
