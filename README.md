# Meeting Cost App

A minimal, mobile-first web application that calculates the real-time cost of a meeting — running entirely in the browser with no backend required.

## Overview

Open the app, select how many people are in each role, tap **Start**, and watch the meeting cost grow in real time.

No names. No individual entries. No complexity.

## Live Demo

Hosted on [GitHub Pages](https://adam46770.github.io/kamilct/)

## Technology Stack

| Layer | Technology |
|---|---|
| Structure | HTML |
| Styling | CSS (mobile-first) |
| Logic | Vanilla JavaScript |
| Persistence | localStorage |
| Hosting | GitHub Pages |

**Primary target:** Safari on iPhone  
**Secondary target:** Desktop browsers

## UX Flow

### Step 1 — Open App
User lands directly on the main screen.

### Step 2 — Select Team Composition
Role tiles with increment/decrement controls:

```
[ Manager   -  2  + ]
[ Senior    -  3  + ]
[ Mid       -  5  + ]
[ Junior    -  1  + ]
```

### Step 3 — Start Meeting
Tap the **Start** button (sticky at the bottom of the screen).

### Step 4 — Live View
- Large live cost counter (primary focus)
- Elapsed time
- Total hourly rate
- Number of participants

### Step 5 — Stop / Reset
- **Pause** — freeze the timer
- **Resume** — continue from where you paused
- **Reset** — clear everything

## Data Model

Meetings are modelled as role counts rather than individual participants:

```js
roles = [
  { name: "Manager", rate: 120, count: 2 },
  { name: "Senior",  rate: 100, count: 3 },
  { name: "Mid",     rate: 70,  count: 5 },
  { name: "Junior",  rate: 50,  count: 1 }
]
```

**Derived values:**
- `totalParticipants = sum(count)`
- `totalHourlyRate = sum(rate × count)`

## Cost Calculation

```
meetingCost = totalHourlyRate × elapsedTimeInHours
```

```
elapsedTimeInHours = (currentTime - startTime - pausedTime) / 3_600_000
```

Time is always based on `Date.now()` timestamps — never on incremental counters.

## Timer State

| Field | Type | Description |
|---|---|---|
| `startTime` | timestamp | When the meeting started |
| `pausedAt` | timestamp \| null | When the pause began |
| `totalPausedMs` | number | Accumulated pause duration |
| `isRunning` | boolean | Whether the timer is active |

The UI updates every ~250–500 ms and recalculates cost from raw timestamps on every tick.

## UI Views

| View | Contents |
|---|---|
| **Main (default)** | Role tiles, total hourly rate, Start button |
| **Active Meeting** | Large cost display, timer, participant count, Pause / Reset |
| **Settings (optional)** | Edit role names, edit rates, select currency |

## Storage

Data is persisted in `localStorage` — no backend, no sync.

| Key | Contents |
|---|---|
| `meetingCost:roles` | Role definitions (name + rate) and last-used counts |
| `meetingCost:settings` | Selected currency and other preferences |

## Currency Support

Uses the native `Intl.NumberFormat` API:

```js
new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN'
})
```

Supported currencies: **PLN**, **EUR**, **USD**

## Mobile Design Principles

- Large, thumb-friendly buttons
- Single-column layout
- No hover-only interactions
- Minimum font size 16 px (prevents iOS auto-zoom)
- Sticky Start button at the bottom
- High-contrast UI

## Performance

- Zero frameworks → instant load
- Minimal JS bundle
- UI updates ~4× per second
- No heavy animations

## MVP Scope

**Must have:**
- [x] Role-based participant counting
- [x] Hourly rate per role
- [x] Start / Pause / Reset controls
- [x] Live cost calculation
- [x] localStorage persistence
- [x] Mobile-friendly UI

## Future Extensions

- [ ] Meeting presets (e.g. "Weekly Standup")
- [ ] Cost-per-minute view
- [ ] Dark mode
- [ ] PWA / Add to Home Screen
- [ ] Cost threshold alerts (e.g. alert when cost exceeds $100)

## Getting Started

No build step required. Clone the repo and open `index.html` in any browser:

```bash
git clone https://github.com/adam46770/kamilct.git
cd kamilct
open index.html
```

Or visit the [GitHub Pages deployment](https://adam46770.github.io/kamilct/) directly.

## License

MIT
