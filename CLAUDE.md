# CLAUDE.md — Agent Guidelines for Meeting Cost App

## Project Summary

This is a frontend-only, mobile-first web app that calculates real-time meeting costs by role.
No backend. No frameworks. No build step. Runs entirely in the browser.

## Technology Constraints

- **HTML + CSS + Vanilla JavaScript only** — do not introduce any framework (React, Vue, etc.)
- **No npm, no bundler, no transpiler** — the app must open directly as `index.html`
- **No external dependencies** — no CDN scripts, no third-party libraries
- **localStorage only** for persistence — no fetch, no API calls, no backend of any kind

## File Structure

Keep the project flat and minimal:

```
index.html       # single HTML entry point
style.css        # all styles
app.js           # all application logic
README.md        # project documentation
CLAUDE.md        # this file
```

Do not create additional files unless explicitly requested.

## Data Model Rules

Roles are always represented as an array of objects with exactly these fields:

```js
{ name: string, rate: number, count: number }
```

- `rate` is the **hourly cost in the selected currency** for one person of that role
- `count` is the number of people of that role in the current meeting
- Do not add extra fields without explicit instruction

Default roles:

```js
[
  { name: "Manager", rate: 120, count: 0 },
  { name: "Senior",  rate: 100, count: 0 },
  { name: "Mid",     rate: 70,  count: 0 },
  { name: "Junior",  rate: 50,  count: 0 }
]
```

Derived values must always be computed on the fly — never stored separately:

```js
totalParticipants = roles.reduce((s, r) => s + r.count, 0)
totalHourlyRate   = roles.reduce((s, r) => s + r.rate * r.count, 0)
```

## Cost Calculation — Non-Negotiable Rules

1. **Always use `Date.now()` timestamps** — never use `setInterval` counters to track elapsed time.
2. The canonical formula is:

```js
elapsedMs       = Date.now() - startTime - totalPausedMs
meetingCost     = totalHourlyRate * (elapsedMs / 3_600_000)
```

3. Pause/resume must update `totalPausedMs`, not `startTime`.
4. The render loop must run every **250–500 ms** — no faster, no slower.

## Timer State

The timer state object must contain exactly these fields:

```js
{
  startTime:     number | null,   // Date.now() when Start was pressed
  pausedAt:      number | null,   // Date.now() when Pause was pressed
  totalPausedMs: number,          // cumulative paused milliseconds
  isRunning:     boolean
}
```

Never derive time from anything other than these fields.

## localStorage Keys

Use only these keys — do not invent new ones without instruction:

| Key | Contents |
|---|---|
| `meetingCost:roles` | JSON array of role objects (name + rate + count) |
| `meetingCost:settings` | JSON object with currency and any future preferences |

Always wrap localStorage reads in try/catch. Never store timer state in localStorage.

## Currency Handling

Use `Intl.NumberFormat` exclusively — do not build a custom formatter:

```js
new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' })
```

Supported currencies: `PLN`, `EUR`, `USD`. Default: `PLN`.

## UI Rules

### Layout
- Single-column layout at all times
- Two views: **Main** (role selection) and **Active Meeting** (live cost)
- Optional third view: **Settings** (edit roles and currency)
- Views are toggled by showing/hiding DOM sections — no routing library

### Mobile-first requirements (never break these)
- All interactive elements minimum **44 × 44 px** touch target
- Minimum font size **16 px** everywhere (prevents iOS Safari auto-zoom)
- Start button **sticky at the bottom** of the viewport
- No interactions that rely on hover state
- High contrast between text and background

### Cost display
- The live meeting cost is the **largest element on the Active Meeting screen**
- Format it with the selected currency using `Intl.NumberFormat`
- Timer shows as `MM:SS` or `HH:MM:SS` when the meeting exceeds 59 minutes

## What the Agent Must Not Do

- Do not install packages or reference a `package.json`
- Do not add a build step, transpiler, or module bundler
- Do not use ES modules (`import`/`export`) — use a single global script tag
- Do not add animations heavier than a CSS transition
- Do not store sensitive data in localStorage
- Do not implement features from the "Future Extensions" list unless explicitly asked
- Do not refactor working code without a specific instruction to do so
- Do not add comments that describe what the code does — only add comments when the WHY is non-obvious

## Coding Style

- Prefer `const` over `let`; never use `var`
- Use `===` for all comparisons
- Keep functions short and single-purpose
- Name variables clearly — `totalHourlyRate` not `thr`
- Format currency and time values only in the render function, never in business logic

## Testing Checklist (run mentally before reporting done)

- [ ] Roles can be incremented and decremented; count cannot go below 0
- [ ] Start is disabled when all counts are 0
- [ ] Cost ticks upward visibly every ~0.5 s during an active meeting
- [ ] Pause freezes the cost; Resume continues from the correct value
- [ ] Reset returns to the Main view with all counts preserved
- [ ] Refreshing the page restores roles and counts from localStorage
- [ ] Currency switch updates all displayed values immediately
- [ ] UI is usable on a 375 px wide screen (iPhone SE)
