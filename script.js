// Prefixo para permitir várias carreiras
const STORAGE_PREFIX = 'fc26_checklist_carreira_';
let currentCareer = '1';

function storageKey() {
  return STORAGE_PREFIX + currentCareer;
}

function loadState() {
  try {
    const raw = localStorage.getItem(storageKey());
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Erro ao ler localStorage', e);
    return {};
  }
}

function saveState(state) {
  localStorage.setItem(storageKey(), JSON.stringify(state));
}

function updateProgress() {
  const tasks = document.querySelectorAll('.task');
  const completed = document.querySelectorAll('.task.completed');
  const progressText = document.getElementById('progress-text');
  const globalBarInner = document.getElementById('global-progress-inner');

  const total = tasks.length;
  const done = completed.length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  if (progressText) {
    progressText.textContent = `Concluídas: ${done}/${total} (${percent}%)`;
  }
  if (globalBarInner) {
    globalBarInner.style.width = `${percent}%`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const careerSelect = document.getElementById('career-select');
  const teamAliasInput = document.getElementById('team-alias');
  const btnClear = document.getElementById('btn-clear');

  // quando trocar de carreira, recarrega o estado
  if (careerSelect) {
    careerSelect.addEventListener('change', () => {
      currentCareer = careerSelect.value || '1';
      applyStateToUI();
    });
    // carreira inicial
    currentCareer = careerSelect.value || '1';
  }

  function applyStateToUI() {
    const state = loadState();

    // nome fantasia
    if (teamAliasInput) {
      teamAliasInput.value = state.teamAlias || '';
    }

    const tasks = document.querySelectorAll('.task');

    tasks.forEach(task => {
      const id = task.dataset.id;
      const checkbox = task.querySelector('.task-checkbox');
      const notes = task.querySelector('.task-notes');
      if (!id || !checkbox || !notes) return;

      const taskState = (state.tasks && state.tasks[id]) || {};

      checkbox.checked = !!taskState.done;
      notes.value = taskState.notes || '';

      if (checkbox.checked) task.classList.add('completed');
      else task.classList.remove('completed');
    });

    updateProgress();
  }

  // listeners de tasks
  function attachTaskListeners() {
    const tasks = document.querySelectorAll('.task');

    tasks.forEach(task => {
      const id = task.dataset.id;
      const checkbox = task.querySelector('.task-checkbox');
      const notes = task.querySelector('.task-notes');
      if (!id || !checkbox || !notes) return;

      function persist() {
        const state = loadState();
        state.tasks = state.tasks || {};
        state.tasks[id] = {
          done: checkbox.checked,
          notes: notes.value
        };
        // preserva o nome fantasia
        if (teamAliasInput) {
          state.teamAlias = teamAliasInput.value;
        }
        saveState(state);
        updateProgress();
      }

      checkbox.addEventListener('change', () => {
        task.classList.toggle('completed', checkbox.checked);
        persist();
      });

      notes.addEventListener('input', persist);
    });
  }

  if (teamAliasInput) {
    teamAliasInput.addEventListener('input', () => {
      const state = loadState();
      state.teamAlias = teamAliasInput.value;
      saveState(state);
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (!confirm('Limpar checklist APENAS desta carreira?')) return;
      localStorage.removeItem(storageKey());
      applyStateToUI();
    });
  }

  attachTaskListeners();
  applyStateToUI();
});
