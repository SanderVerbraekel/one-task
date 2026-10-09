---
doc: prd
status: approved
---

# One Task — Product Requirements

A cozy to-do for someone with ADHD: each time they start the app they set how focused they are, and the app shows one task they can handle. Working name, from `scope.md > One Task`.

Source for the spine: `scope.md > The Core Loop`, `scope.md > The Unique Kernel`, `scope.md > What "Working" Looks Like`.

## The Core Journey

1. They start the app and see a slider. They set a focus score from 1 to 100 for this moment. That score is the one the app uses for the task that follows.
2. If they have not added any tasks, they see a button to add the first one. They enter what the task is, choose low or high effort themselves, and enter how long they think it will take. It joins the hidden pool, and the app then shows it.
3. If the pool already has tasks, the app shows exactly one. A score above 60 calls for high effort. A score of 60 or below calls for low effort. The first task of the day is the one in that effort group with the least estimated time. If that group is empty, they still get one task, from the other effort, and it is still the shortest estimate because it is the first of the day.
4. On screen: the task and its detail, whether it is low or high effort, the focus score on a gauge, and a way to add another task. They cannot see the pool or switch tasks.
5. They do the real task away from the app. Writing the mail happens somewhere else.
6. They come back and press "Task finished." The app calculates the time from when that task appeared until the press, and compares it with the estimate. The more time over the estimate, the more the score falls. The more time under the estimate, the more the score rises. The score stays inside 1–100.
7. The next task appears immediately. It is a random task of the effort the new score calls for. The estimate is not used for this pick. If that effort group is empty, the task is a random one from the other effort.
8. The pile stays hidden. They come back because the next manageable task is the only thing waiting.

The moment that proves it, from `scope.md > What "Working" Looks Like`: finish a task, watch the score move from time spent versus the estimate, and see the next task match the new score.

## Screens and Layout

Three surfaces. No task list.

### Startup focus
The first surface every time the app starts. A slider from 1 to 100, and nothing else competing with it. The score sitting on the slider is the starting focus. Setting it opens the task surface.

### The one task
One task in the middle, set apart from the page so it reads as the task: what it is, low or high effort, and the focus score on a gauge. "Task finished" is the action that completes the loop. A button adds another task into the hidden pool without replacing the one on screen. When the pool is empty, this surface is the button to add the first task instead of a task.

### Add a task
What the task is, low or high effort chosen by them, and a time estimate. Saving puts it in the pool. If it was the first task, the app shows it. If a task was already on screen, that task stays; the new one waits unseen.

## Look and Feel

Warm colors. A cozy feeling, so the task does not feel like an office obligation. Nothing office-like.

The focus score is a gauge from blue (cold) to red (hot). A score of 1 sits at the blue end. A score of 100 sits at the red end. The marker moves with the score, and the number sits beside the bar. Effort stays in words, low or high, not on the gauge.

No typeface and no reference app were named.

## Features and Behavior

### Setting focus on startup
Develops `scope.md > The Core Loop`. The slider appears every time the app starts. They set the score for how focused they are at that moment. Above 60 is high enough for a high-effort task. 60 or below gets a low-effort task.

- [ ] Starting the app shows a slider that can be set from 1 to 100, and that value is the focus score used for the task that appears next.
- [ ] A score of 61 or higher is treated as high effort. A score of 60 or lower is treated as low effort.

### Adding a task
Develops `scope.md > The POC Boundary`. They judge effort themselves. The app does not assign it.

- [ ] They can enter the task, choose low or high effort, and enter a time estimate.
- [ ] With an empty pool, the only action is adding that first task, and saving it puts that task on screen.
- [ ] With a task already on screen, saving another adds it to the hidden pool and leaves the current task in place.

### The one task on screen
Develops `scope.md > The Unique Kernel`.

- [ ] Only one task is visible, with its detail, its effort, and the focus score.
- [ ] The focus gauge marker sits toward blue at a low score and toward red at a high score, matching the number beside it. Effort is still written as low or high.
- [ ] No other unfinished task is visible, and there is no control that switches away from the current task.

### Choosing which task appears
The first task of the day uses the estimate. Later tasks do not.

- [ ] For the first task of the day, the app shows the matching-effort task with the least estimated time.
- [ ] After "Task finished," the next task is a random one of the effort the updated score calls for, and a longer or shorter estimate does not decide it.
- [ ] If the pool has tasks but none of the effort the score calls for, a task of the other effort is shown. The first of the day is still the shortest estimate in that other group. Later picks are still random in that other group.

### Finishing a task and the focus score
Develops `scope.md > What "Working" Looks Like`.

- [ ] "Task finished" is available on the current task.
- [ ] The app calculates time from when the task appeared until "Task finished," compares it with the estimate, and changes the score.
- [ ] Going over the estimate lowers the score, and a bigger overrun lowers it more. Finishing under the estimate raises the score, and a bigger gap under the estimate raises it more.
- [ ] The score never displays below 1 or above 100.
- [ ] After the score updates, the next task is on screen and its effort matches the rule for the new score, including the fallback to the other effort when needed.

## States and Boundaries

- **First start, nothing added** — slider, then a button to add the first task. No empty task card.
- **Normal loop** — one task, finish it, score updates, next task appears.
- **Needed effort is missing** — a task of the other effort still appears. The screen does not dead-end.
- **Task already on screen, add another** — the new task is stored and not shown until the app picks it.
- **What remains** — unfinished tasks stay in the pool after the app is closed. A task already finished today is not the "first task of the day" again. Each new startup asks for focus on the slider again; the old score is not reused in place of that slider.
- **What the app will not show** — the pool, a way to switch tasks, the work of the task itself.

## Product Decisions

- Slider on every startup — focus at that moment is theirs to set, because ADHD focus is not steady.
- Score is 1–100, and above 60 means high effort — their cutoff for "high enough."
- First task of the day is the shortest estimate of the matching effort — so the day starts with the smallest fitting task. After that, time does not matter and the next task is random among the fitting effort.
- If the fitting effort is missing, show the other effort — so there is still one task.
- Effort is their judgment at creation — from `scope.md > Explicitly Cut`.
- Warm, cozy, not office-like, with a blue-cold to red-hot gauge for the focus score — so the screen does not feel like an obligation. Effort stays in words.
- Time spent is calculated by the app from when the task appears until "Task finished" — they do the task away, come back, and the app compares that time with the estimate.

## What We're Building

The startup slider, the hidden pool, add-a-task with their own effort and estimate, one task on screen with the focus gauge and the effort in words, no switching, "Task finished," a score that rises or falls with how far under or over the estimate they were, the first-of-day shortest pick, later random picks, and the fallback to the other effort.

## Deferred From the POC

From `scope.md > Later`:

- A Pomodoro timer as its own way to judge focus. The proof is the comparison after "Task finished."
- Setting the focus score by hand in the middle of a session. Startup is the slider. After that, the score moves only when a task is finished.

## Possible Later Enhancements

A Pomodoro timer beside the estimate comparison. A way to nudge the focus score without finishing a task.

## Non-Goals

- Seeing or browsing the pool. The list stays hidden (`scope.md > Explicitly Cut`).
- Switching tasks before the current one is finished.
- Doing the real-world task inside the app.
- The app assigning low or high effort.

## Open Questions

- How many points the score gains or loses for a given amount under or over the estimate. The direction and "a bigger gap moves it more" are decided. The exact arithmetic is not. `4-spec` proposes that arithmetic for agreement before build. It does not change which task the score calls for: the cutoff stays at 60.
- No typeface was chosen. `4-spec` can pick type that stays cozy and not office-like, without a second design interview.
