const STORAGE_KEY = 'one-task';

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return String(Date.now());
}

function emptyState() {
  return { focusScore: 50, finishedOn: null, tasks: [] };
}

function todayString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

function effortForScore(score) {
  return score > 60 ? 'high' : 'low';
}

function unfinishedTasks(tasks) {
  return tasks.filter(function (task) {
    return task.finishedAt == null;
  });
}

function pickTask(state, now) {
  const open = unfinishedTasks(state.tasks);
  if (open.length === 0) {
    return null;
  }

  const preferred = effortForScore(state.focusScore);
  let band = open.filter(function (task) {
    return task.effort === preferred;
  });
  if (band.length === 0) {
    band = open.filter(function (task) {
      return task.effort !== preferred;
    });
  }
  if (band.length === 0) {
    return null;
  }

  const firstOfDay = state.finishedOn !== todayString(now);
  if (!firstOfDay) {
    return band[Math.floor(Math.random() * band.length)];
  }

  return band.slice().sort(function (a, b) {
    if (a.estimateMinutes !== b.estimateMinutes) {
      return a.estimateMinutes - b.estimateMinutes;
    }
    return a.createdAt - b.createdAt;
  })[0];
}

function normalize(data) {
  if (!data || typeof data !== 'object') {
    return emptyState();
  }

  const focus = Number(data.focusScore);
  const tasks = Array.isArray(data.tasks)
    ? data.tasks.filter(function (task) {
      return task
        && typeof task.id === 'string'
        && typeof task.detail === 'string'
        && (task.effort === 'low' || task.effort === 'high');
    }).map(function (task) {
      return {
        id: task.id,
        detail: task.detail,
        effort: task.effort,
        estimateMinutes: Number(task.estimateMinutes),
        createdAt: Number(task.createdAt) || 0,
        shownAt: task.shownAt == null ? null : Number(task.shownAt),
        finishedAt: task.finishedAt == null ? null : Number(task.finishedAt)
      };
    })
    : [];

  return {
    focusScore: Number.isInteger(focus) && focus >= 1 && focus <= 100 ? focus : 50,
    finishedOn: typeof data.finishedOn === 'string' ? data.finishedOn : null,
    tasks: tasks
  };
}

function scoreAfterFinish(focusScore, estimateMinutes, spentMinutes) {
  const points = (estimateMinutes - spentMinutes) * 2;
  const next = focusScore + points;
  if (next < 1) return 1;
  if (next > 100) return 100;
  return next;
}

function validateTask(detail, effort, estimateRaw) {
  const problems = [];
  if (!detail.trim()) {
    problems.push('Add what the task is.');
  }
  if (effort !== 'low' && effort !== 'high') {
    problems.push('Choose low or high effort.');
  }
  const minutes = estimateRaw.trim();
  if (!/^\d+$/.test(minutes) || Number(minutes) < 1) {
    problems.push('Enter a whole number of minutes, at least 1.');
  }
  return problems;
}

const storageError = document.querySelector('#storage-error');
const screenSlider = document.querySelector('#screen-slider');
const screenTask = document.querySelector('#screen-task');
const screenForm = document.querySelector('#screen-form');
const focusSlider = document.querySelector('#focus-slider');
const sliderValue = document.querySelector('#slider-value');
const taskCard = document.querySelector('#task-card');
const taskDetail = document.querySelector('#task-detail');
const taskEffort = document.querySelector('#task-effort');
const focusScore = document.querySelector('#focus-score');
const gauge = document.querySelector('#gauge');
const gaugeMarker = document.querySelector('#gauge-marker');
const emptyPool = document.querySelector('#empty-pool');
const addAnother = document.querySelector('#add-another');
const taskForm = document.querySelector('#task-form');
const taskText = document.querySelector('#task-text');
const estimateInput = document.querySelector('#estimate');
const formError = document.querySelector('#form-error');
const finishError = document.querySelector('#finish-error');

let state = emptyState();
let storageBroken = false;
let screen = 'slider';
let currentId = null;
let finishNote = '';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      state = emptyState();
      return;
    }
    state = normalize(JSON.parse(raw));
  } catch (err) {
    if (err instanceof SyntaxError) {
      state = emptyState();
      return;
    }
    storageBroken = true;
    state = emptyState();
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    storageBroken = true;
    return false;
  }
}

function render() {
  storageError.hidden = !storageBroken;
  finishError.hidden = finishNote === '';
  finishError.textContent = finishNote;
  screenSlider.hidden = screen !== 'slider';
  screenTask.hidden = screen !== 'task';
  screenForm.hidden = screen !== 'form';

  if (screen === 'slider') {
    focusSlider.value = String(state.focusScore);
    sliderValue.textContent = String(state.focusScore);
  }

  if (screen === 'task') {
    const task = state.tasks.find(function (item) {
      return item.id === currentId && item.finishedAt == null;
    });
    taskCard.hidden = !task;
    emptyPool.hidden = Boolean(task);
    addAnother.hidden = !task;
    if (task) {
      taskDetail.textContent = task.detail;
      taskEffort.textContent = task.effort === 'high' ? 'high effort' : 'low effort';
      focusScore.textContent = String(state.focusScore);
      placeFocusMarker(state.focusScore);
    }
  }
}

function placeFocusMarker(score) {
  const span = (score - 1) / 99;
  gaugeMarker.style.left = 'calc(' + span + ' * (100% - 1.15rem))';
  gauge.setAttribute('aria-valuenow', String(score));
}

function finishTask() {
  const task = state.tasks.find(function (item) {
    return item.id === currentId && item.finishedAt == null;
  });
  if (!task) return;

  if (task.shownAt == null) {
    finishNote = 'This finish could not be timed. Try again.';
    render();
    return;
  }

  const previous = JSON.parse(JSON.stringify(state));
  const previousId = currentId;
  const spentMinutes = Math.round((Date.now() - task.shownAt) / 60000);
  state.focusScore = scoreAfterFinish(state.focusScore, task.estimateMinutes, spentMinutes);
  task.finishedAt = Date.now();
  state.finishedOn = todayString(new Date());

  const picked = pickTask(state, new Date());
  if (picked) {
    picked.shownAt = Date.now();
    currentId = picked.id;
  } else {
    currentId = null;
  }

  finishNote = '';
  if (!persist()) {
    state = previous;
    currentId = previousId;
    render();
    return;
  }

  screen = 'task';
  render();
}

function showMyTask() {
  finishNote = '';
  state.focusScore = Number(focusSlider.value);
  if (!persist()) {
    render();
    return;
  }

  const picked = pickTask(state, new Date());
  if (!picked) {
    currentId = null;
    screen = 'task';
    render();
    return;
  }

  const previousShownAt = picked.shownAt;
  picked.shownAt = Date.now();
  currentId = picked.id;
  if (!persist()) {
    picked.shownAt = previousShownAt;
    currentId = null;
    render();
    return;
  }

  screen = 'task';
  render();
}

function openForm() {
  finishNote = '';
  taskForm.reset();
  formError.hidden = true;
  formError.textContent = '';
  screen = 'form';
  render();
}

function saveTask(event) {
  event.preventDefault();
  const effortInput = taskForm.querySelector('input[name="effort"]:checked');
  const effort = effortInput ? effortInput.value : '';
  const problems = validateTask(taskText.value, effort, estimateInput.value);
  if (problems.length > 0) {
    formError.textContent = problems.join(' ');
    formError.hidden = false;
    return;
  }

  const task = {
    id: createId(),
    detail: taskText.value.trim(),
    effort: effort,
    estimateMinutes: Number(estimateInput.value.trim()),
    createdAt: Date.now(),
    shownAt: null,
    finishedAt: null
  };

  state.tasks.push(task);
  if (!persist()) {
    state.tasks.pop();
    render();
    return;
  }

  if (!currentId) {
    const picked = pickTask(state, new Date());
    if (picked) {
      const previousShownAt = picked.shownAt;
      picked.shownAt = Date.now();
      currentId = picked.id;
      if (!persist()) {
        picked.shownAt = previousShownAt;
        currentId = null;
      }
    }
  }

  screen = 'task';
  render();
}

focusSlider.addEventListener('input', function () {
  sliderValue.textContent = focusSlider.value;
});

document.querySelector('#show-task').addEventListener('click', showMyTask);
document.querySelector('#finish-task').addEventListener('click', finishTask);
document.querySelector('#add-first').addEventListener('click', openForm);
addAnother.addEventListener('click', openForm);
document.querySelector('#cancel-add').addEventListener('click', function () {
  screen = 'task';
  render();
});
taskForm.addEventListener('submit', saveTask);

load();
render();
