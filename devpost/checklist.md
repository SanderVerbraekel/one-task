---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. You set your focus and the app shows one fitting task**
  Becomes usable: You open the page, set a focus score, add tasks with your own effort and a time estimate, and see only one task — the shortest one that matches your focus. Any other task stays hidden. Closing the page keeps the tasks, and the next open asks for focus again. The task stands out on its own card. The blue-to-red gauge tracks the focus score.
  Why now: This is the first half of the kernel — one task, chosen from focus and effort, pool hidden — and the page, sticky note, and look have to exist for that to be tryable. The finish-and-score moment needs a task already on screen, so it comes second. `crypto.randomUUID` is checked once here, as the spec asked.
  PRD ref: `prd.md > The Core Journey` (steps 1–4), `prd.md > Setting focus on startup`, `prd.md > Adding a task`, `prd.md > The one task on screen`, `prd.md > Choosing which task appears` (first task of the day), `prd.md > States and Boundaries`, `prd.md > Look and Feel`
  Spec ref: `spec.md > File Structure`, `spec.md > Where It Runs and How Someone Tries It`, `spec.md > Components` (Startup slider, Task screen, Add-task form, Task picker, Task store), `spec.md > Data Model`, `spec.md > Look and Feel`, `spec.md > Stack`, `spec.md > Important Failure Modes` (bad form, localStorage)
  Build: Create `index.html`, `styles.css`, `app.js`, and `README.md`. Slider from 1–100 defaulting to the last score or 50, "Show my task," add-task form, hidden pool under `localStorage` key `one-task`, first-of-day picker (shortest matching effort, otherwise shortest of the other effort, ties to the earliest task), a task card labeled "Your task," and a focus gauge whose marker moves from blue at 1 to red at 100. No pool and no switch. Use `crypto.randomUUID` on localhost and fall back to a timestamp string if it is missing. Reject blank text, missing effort, and an estimate that is empty, zero, or not a whole number of minutes. If `localStorage` throws, say tasks cannot be kept in this browser.
  Verify (mechanical): Run `python -m http.server 8765` and open `http://127.0.0.1:8765/`. Confirm the server starts cleanly. Set focus above 60 and at or below 60 with mixed-effort tasks and confirm only the shortest matching task is shown, including the other-effort fallback and the earliest-task tie. Add a task while one is showing and confirm the current task stays. Reload and confirm unfinished tasks remain and the slider is back. Submit a blank form and confirm nothing is saved. Confirm each new task gets an id from `crypto.randomUUID` or the timestamp fallback.
  Learner check: Open the app, set your focus, add two tasks with different effort, and say whether the one task on screen is the one you expected — and whether the screen feels cozy rather than like an office list.
  Commit: `Show one task chosen from focus`

- [x] **2. Finishing a task moves your focus and brings the next one**
  Becomes usable: You press "Task finished." The score rises or falls by 2 points per minute versus the estimate, stays between 1 and 100, and the next task appears at once. After the first finish today, that next task is a random one of the effort the new score calls for, or the other effort if that group is empty. When nothing unfinished is left, you see the button to add a task again.
  Why now: This is the moment the proof depends on, and it only works after a task is already on screen with a start time. The random pick is the other branch of the same chooser, so it belongs with the score update rather than in a separate plumbing step.
  PRD ref: `prd.md > The Core Journey` (steps 5–8), `prd.md > Finishing a task and the focus score`, `prd.md > Choosing which task appears` (after "Task finished")
  Spec ref: `spec.md > The Core Journey Through the System` (steps 6–7), `spec.md > Components` (Score update, Task picker), `spec.md > Data Model` (`finishedOn`, `shownAt`, `finishedAt`), `spec.md > Important Failure Modes` (missing `shownAt`)
  Build: When a task is placed on screen, set `shownAt`. "Task finished" rounds the gap to the nearest minute, adds `(estimateMinutes - spentMinutes) * 2`, clamps the score to 1–100, sets `finishedAt` and `finishedOn` to today's local date, then picks the next task at random in the matching effort, or the other effort if that group is empty. An empty pool shows the add button. If `shownAt` is missing, leave the score unchanged and keep the task on screen.
  Verify (mechanical): With the server running, run the score function for a 10-minute estimate at 15 minutes spent (−10), 5 minutes spent (+10), the same minute (0), and values that would pass 100 or fall under 1 (clamp to those edges). On the page, add a 1-minute task, press "Task finished" immediately, and confirm the score rises and the next task's effort matches the new score, including the other-effort fallback. Confirm a later finish the same day does not use the shortest-estimate rule. Confirm a missing `shownAt` leaves the score unchanged.
  Learner check: Add a short task, press "Task finished" soon after it appears, and say whether the score moved the way you expected and the next task fits that new score.
  Commit: `Update focus when a task is finished`

## Hands-on Checkpoints

- [x] Early usable behavior explored — after slice 1, before the finish-and-score slice
- [x] Final kick-the-tires exploration and feedback completed

## Final Review

- [x] Final review complete — feedback resolved and learner confirms ready to ship

No changes requested. The learner tried the full loop, said it looks good, and confirmed the proof of concept is ready.

## Code Tour and App Map

- [x] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [x] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [x] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: Brief recap of a decision already recorded in `spec.md > Decisions and Open Issues`: `localStorage` and `Date.now()`, not a database or a timer library. Build evidence: `scoreAfterFinish(50, 10, 15)` returned 40, and finishing a 1-minute task at focus 80 showed 82 and the other-effort task.
Route and stops: Reference route only, not walked live. `index.html` `#finish-task` → `app.js` `finishTask` → `app.js` `scoreAfterFinish` and `pickTask` → `app.js` `render` and `placeFocusMarker`.
Edit outcome: not applicable
Reflection: offered
Activity mode: recap

## Revisions

- The focus gauge marker moves with the score from 1 to 100, and the task sits on its own card under "Your task" — the learner read the old effort gauge as a focus meter and missed the task because it looked like a page title.
