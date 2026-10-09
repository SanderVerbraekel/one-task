---
doc: spec
status: approved
---

# One Task — Technical Spec

## How This Works, In Plain Language

One page in the browser. No account, no server, no database. The tasks sit in `localStorage`, a sticky note the browser keeps for this page on this computer. Closing the page does not erase them. Clearing the browser's saved site data does.

The page has three moments: a focus slider, one task, and a small form to add a task. A bit of JavaScript reads the sticky note, picks the one task, watches the clock, and writes the new score back. The browser's own clock is enough. There is no timer library.

This shape is enough because the proof is one person and one task on screen. A framework or a database would add setup that does not change what the demo shows. The accepted tradeoff: the tasks stay in that browser on that computer.

## The Core Journey Through the System

PRD ref: `prd.md > The Core Journey`.

1. They open the page. `app.js` reads the sticky note. The slider is the only thing on screen. Nothing is picked yet.
2. They set 1–100 and press "Show my task." That number is saved as today's starting focus. Above 60 means high effort. 60 or below means low effort. Implements `prd.md > Setting focus on startup`.
3. If the sticky note has no unfinished task, they see "Add your first task" instead of a task. Implements `prd.md > States and Boundaries`.
4. They type what the task is, choose low or high effort, and enter a whole number of minutes. Saving appends it to the pool in the sticky note. If a task is already on screen, it stays there. If nothing was on screen, the picker runs and shows the new task. Implements `prd.md > Adding a task`.
5. The picker looks at unfinished tasks of the effort the score calls for. If that group is empty, it uses the other effort. The first task of the day — no task finished yet on today's local date — is the one in that group with the smallest estimate. Ties go to the one added earliest. After any finish today, the next pick is random in that group, and the estimate does not matter. The chosen task is marked shown, and the clock starts. Implements `prd.md > Choosing which task appears` and `prd.md > The one task on screen`.
6. They leave and do the real task somewhere else. The page can stay open. The clock is the gap between "shown" and "Task finished," not a timer they have to watch.
7. "Task finished" rounds that gap to the nearest minute. Each minute under the estimate adds 2 points. Each minute over subtracts 2. The score is kept between 1 and 100 and written back. The task is marked finished for today. The picker immediately shows the next task. Implements `prd.md > Finishing a task and the focus score`.

A 10-minute task finished in 15 minutes loses 10 points. The same task finished in 5 minutes gains 10.

## Stack

- HTML, CSS, and JavaScript in the browser. No framework. Agreed because the proof is three surfaces and a clock. Tradeoff accepted: no install step for the app itself, and no shared account across computers.
- `localStorage` for the pool, the score, and whether a task was finished today. Documentation: [MDN localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
- `Date.now()` for the two timestamps. Documentation: [MDN Date.now()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now). No timer library. Agreed: the page only needs when the task appeared and when they press the button.
- `crypto.randomUUID()` for task ids on `http://localhost`. Documentation: [MDN randomUUID](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID). If it is missing, fall back to a timestamp string. Check that once at the start of the build.
- Python 3's built-in web server, only so the demo has a normal local address. It is not part of the app. Documentation: [Python http.server](https://docs.python.org/3/library/http.server.html). This machine already ran that server in planning. No packages to install.

## Where It Runs and How Someone Tries It

Local browser only. No API keys. Deployment is not part of this proof. The submission still needs a short screen recording and a public GitHub repository. The recording is of this local page.

From the project folder:

```
python -m http.server 8765
```

Open `http://127.0.0.1:8765/`.

What the recording should show: set the slider, see one task (the shortest fitting estimate if it is the first of the day), press "Task finished" after the time has passed the estimate or beaten it, see the score move by 2 points per minute, and see the next task match the new side of 60.

## Look and Feel

Carried from `prd.md > Look and Feel` and `scope.md > Inspiration & Identity`. Plain CSS can do all of this. No font download.

- Page background a warm cream, text a warm brown, buttons soft and rounded. Spacious, not a dense dashboard.
- The task title uses a system serif (Palatino, Georgia). Body text uses the system sans. Chosen here because no typeface was named and the page must work offline. Cozy, not office.
- Copy stays short. The finish button says "Task finished," as in the PRD. The slider's leave control says "Show my task." Avoid productivity jargon.
- The focus gauge is a horizontal bar from cold blue (`#3d6f8a`) to hot red (`#c4482d`). Score 1 puts the marker on the blue end. Score 100 puts it on the red end. Scores in between sit on that span. The number is beside the bar. Effort stays the words "low effort" or "high effort." The task sits in its own card under the label "Your task," so it is not read as a page heading.

## Components

### Startup slider
The first screen on every load. A range input from 1 to 100, defaulting to the last saved score or 50 if none exists. "Show my task" saves that value as the score and opens the task screen. It does not pick a task before the press.
PRD ref: `prd.md > Setting focus on startup`.

### Task screen
Shows one unfinished task in its own card: a "Your task" label, its words, "low effort" or "high effort," and the focus gauge with the marker placed from the score. "Task finished" runs the score update and the picker. "Add a task" opens the form and does not change the task on screen. If the pool has no unfinished task, this screen is only the add-first-task action.
PRD ref: `prd.md > The one task on screen`.

### Add-task form
Three fields: the task text, low or high effort, and estimated minutes. Save writes one task into the pool. Cancel returns without writing. The first saved task is then picked and shown. A later save leaves the current task in place.
PRD ref: `prd.md > Adding a task`.

### Task picker
Pure function over the unfinished tasks, the score, and today's date. Effort band: score greater than 60 is high, otherwise low. Prefer that band; if it is empty, use the other. First finish of the local day has not happened yet → smallest `estimateMinutes`, then earliest `createdAt`. A finish has happened today → one random unfinished task in the chosen band. An empty pool returns nothing, and the task screen shows the add button.
PRD ref: `prd.md > Choosing which task appears`.

### Score update
Pure function. `spentMinutes` is `Date.now() - shownAt`, divided by 60000, rounded to the nearest minute. `points = (estimateMinutes - spentMinutes) * 2`. New score is the old score plus `points`, clamped to 1–100. On time, the score does not change.
PRD ref: `prd.md > Finishing a task and the focus score`.

### Task store
One `localStorage` key, `one-task`. Read on load. Write after every add, finish, and focus set. See Data Model.
PRD ref: `prd.md > States and Boundaries`.

## Data Model

One JSON object under `localStorage` key `one-task`:

```json
{
  "focusScore": 50,
  "finishedOn": null,
  "tasks": [
    {
      "id": "uuid",
      "detail": "write a mail",
      "effort": "low",
      "estimateMinutes": 10,
      "createdAt": 0,
      "shownAt": null,
      "finishedAt": null
    }
  ]
}
```

- `focusScore` — last score, 1–100. Updated when they press "Show my task" and again on "Task finished." On the next startup the slider shows this number, but the task screen does not open until they press "Show my task" again. Leaving and coming back does not skip the slider.
- `finishedOn` — local calendar date `YYYY-MM-DD` of the latest finish, or `null`. If it equals today, the picker uses the random rule. If it is missing or an earlier date, the next task shown is the first of the day. Closing the page keeps this value.
- `tasks` — unfinished ones have `finishedAt: null` and stay after reload. Finished ones stay in the array so "already finished today" is remembered, and they are never shown. `shownAt` is set when that task is placed on screen and is the start of the clock. A task waiting in the pool has `shownAt: null` until it is picked.
- `effort` is only `"low"` or `"high"`. The app never assigns it.

## File Structure

```
index.html          # slider, task screen, add form; no task list
styles.css          # warm layout, serif task title, blue-to-red gauge
app.js              # store, picker, score, and which screen is visible
README.md           # the start command and what the recording should show
devpost/            # planning docs; not loaded by the app
```

No `package.json`. No build step.

## External Services and Dependencies

None. No API, no hosted database, no account, no key, no cost, no rate limit. The only outside tool is Python 3 on the command line, to serve the folder for the recording. The page does not call it.

## Important Failure Modes

- **The estimate is empty, zero, or not a whole number, or the task text is blank, or effort was not chosen** → stay on the form and say what is missing. Do not write a task.
- **`localStorage` throws or is unavailable** → show a plain message that tasks cannot be kept in this browser. Do not pretend the pool was saved.
- **The pool is empty, or a shown task is missing a `shownAt`** → empty pool shows the add button. A missing `shownAt` does not change the score; the task stays on screen and the page asks them to try again only if the finish cannot be timed.

## What Was Simplified and Why

- **The browser's sticky note** instead of a database — one person, one computer. A database would need a server and an account. Agreed.
- **The browser clock** instead of a timer library — two timestamps are the whole clock. Agreed.
- **A local page and a screen recording** instead of a deployed site — the video is the required proof. Hosting was left optional.
- **System fonts** instead of a downloaded font — the cozy serif has to work offline. No typeface was named in the PRD.
- **"Show my task"** instead of a second focus control during the session — startup is the only time they set the score by hand. From `prd.md > Deferred From the POC`.

## Decisions and Open Issues

- **Page and sticky note** — learner accepted the recommendation. Reason: the proof does not need a server. Tradeoff: data stays in this browser.
- **2 points per minute, nearest minute, clamp 1–100** — learner accepted the recommendation. Reason: a bigger gap moves the score more, and the 60 cutoff stays put. Tradeoff: a long overrun can sit the score on 1.
- **"Show my task," system serif, and the tie going to the earliest task** — implementation details derived from the PRD, not separate product choices.
- **How the agent picks tools** — the learner wanted to see this. Clarified here: `localStorage` and `Date.now()` were chosen, and a server, a database, and a timer library were not, because the page only has to remember one pool and two times. No extra investigation. If the build reaches for another library, say why before adding it.
- **PRD open question on the arithmetic** — closed by the 2-points-per-minute rule above.
- Nothing else is unresolved for the build.
