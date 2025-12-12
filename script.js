const STORAGE_KEY = 'bmg_fc26_checklist_v1';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Erro ao ler localStorage', e);
    return {};
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function updateProgress() {
  const tasks = document.querySelectorAll('.task');
  const completed = document.querySelectorAll('.task.completed');
  const progressText = document.getElementById('progress-text');
  if (!progressText) return;
  const total = tasks.length;
  const done = completed.length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  progressText.textContent = `Concluídas: ${done}/${total} (${percent}%)`;
}

document.addEventListener('DOMContentLoaded', () => {
  const state = loadState();
  const tasks = document.querySelectorAll('.task');

  tasks.forEach(task => {
    const id = task.dataset.id;
    const checkbox = task.querySelector('.task-checkbox');
    const notes = task.querySelector('.task-notes');

    if (!id || !checkbox || !notes) return;

    // restaurar
    if (state[id]) {
      checkbox.checked = !!state[id].done;
      notes.value = state[id].notes || '';
      if (checkbox.checked) task.classList.add('completed');
    }

    checkbox.addEventListener('change', () => {
      const current = state[id] || {};
      current.done = checkbox.checked;
      current.notes = notes.value;
      state[id] = current;
      if (checkbox.checked) task.classList.add('completed');
      else task.classList.remove('completed');
      saveState(state);
      updateProgress();
    });

    notes.addEventListener('input', () => {
      const current = state[id] || {};
      current.done = checkbox.checked;
      current.notes = notes.value;
      state[id] = current;
      saveState(state);
    });
  });

  // botão limpar
  const btnClear = document.getElementById('btn-clear');
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (!confirm('Limpar todo o checklist? Isso remove o progresso salvo neste navegador.')) return;
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    });
  }

  updateProgress();
});
