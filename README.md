# Staff Scheduler

A fortnightly staff roster builder for a small store. Runs entirely in the browser — no server, no build step, no install. Open the page and use it.

**▶ [Open the app](https://venkatesanps.github.io/staff-scheduler/)**

## What it does

Builds a roster for a two-week cycle (1st–15th, or 16th–end of month) from rules you define, honours staff day-off requests where the rules allow, and — this is the point — explains every single decision.

Tap or click any person on any day and you get the reasoning:

> **Suganthi — Fri 7 Aug — Day off**
> *Requested day off — honoured:* Suganthi asked for this day off (family function).

or, when a preference can't be met:

> *Weekend coverage:* Weekend work is mandatory for all staff except designated exceptions.
> *Preference overridden:* Day-off request could not be honoured; minimum coverage is 4.

## Features

- **Staff** — add and remove people at any time; set role, a personal cap on working days, and the **Weekend off allowed** tick that excepts someone from mandatory weekend work.
- **Rules** — build your own rules from scratch, or start from a ready-made one. Each rule can be toggled on/off, reordered, and set as **hard** (never broken) or **soft** (bends when coverage would otherwise fail).
- **Time-off requests** — each person can request days off or days they'd prefer to work, at normal or urgent priority. Every request is reported back as honoured or not, with the reason.
- **Explanations** — per person, per day, in plain English, using your own rule names.
- **Conflict reporting** — when two hard rules can't both hold, you get a banner saying exactly which rules collided and how it was resolved.
- **Responsive** — day-card layout on phones, scrollable grid on tablet and laptop. Switches automatically, or pick a view from the toolbar.
- **Export** — download the roster as CSV.

## Writing your own rule

Name it, then compose it from a small grammar:

| Part | Options |
|---|---|
| **Applies to** | everyone · a specific person · everyone in a role · everyone except a specific person |
| **They** | must work · must not work · prefer to work · prefer not to work · at most N of them work · at least N of them work |
| **When** | every day · weekdays · weekends · a specific weekday · a specific date |
| **Except** | carve out named individuals |

The card shows your rule as a sentence as you build it, e.g. *"At least 2 Supervisors work on weekends."* That name and sentence are what appear in the explanations.

Ready-made rules cover the common cases: **store closed (weekly holiday)**, max/min staff per day, mandatory weekends with exceptions, max consecutive days, minimum days off per cycle, maximum working days per cycle, standing days off, fixed working days, role coverage, and fair rotation.

### Weekends

Most of the trade happens at the weekend, so **weekend work is mandatory for everyone and outranks the other rules**. On a Saturday or Sunday the daily cap is lifted to fit every staff member, and the rest-day limits (max consecutive days, max days per cycle, personal caps) don't hold anyone back. The roster absorbs this automatically — rest days are booked onto weekdays instead, early enough that a "minimum days off per cycle" rule is still met in full.

**The only way to except someone is the "Weekend off allowed" tick on the Staff tab.** It starts empty — nobody is excepted by default. There is no exception list on the rule itself, so there's exactly one place to look.

### Store holidays

**Tuesday is set as the store's weekly holiday by default.** Nobody is rostered on a closed day, and it shows in the roster as a greyed-out "shut" column.

Closed days are deliberately **not** counted as anyone's day off — if you also require two days off per cycle, staff get those two rest days *on top of* the Tuesday closures, rather than the closure quietly satisfying the rule. Closed days do break a run of consecutive working days.

Change the closed day, add more (some stores shut two days), or switch it off entirely by editing the rule on the Rules tab.

## How the scheduler works

A greedy day-by-day pass. For each day it applies every enabled rule to build, for each person, a list of *required to work*, *hard blocks*, and *soft blocks*; seats the required people; fills the remaining slots ranked by fewest shifts worked so far; satisfies any "at least N of X" floors, displacing people if it must; and if coverage still falls short, overrides soft preferences and records why. Every step writes a sentence into that person's explanation for that day.

**Limitation worth knowing:** it does not backtrack. A heavily over-constrained rule set can produce a workable-but-not-optimal roster rather than proving that no valid roster exists. Rule order matters — rules are applied top to bottom. For guaranteed-optimal rosters you'd want a constraint solver.

## Data and privacy

Everything is stored in your browser's `localStorage` on your own device. Nothing is uploaded, and there is no backend, no account, and no analytics. Clearing your browser data clears the roster. **Reset demo data** restores the sample staff and rules.

Because state is per-browser, two people opening the page do not share data.

## Running it locally

Download `index.html` and open it in any browser. That's the whole app — one file, no dependencies.

## Licence

MIT — see [LICENSE](LICENSE).
