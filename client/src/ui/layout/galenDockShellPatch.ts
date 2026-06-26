const BOOT_KEY = '__olympusGalenDockShellReady';
const VIEW_KEY = 'olympus.desk.v2.view';

type ScopedWindow = Window & { [BOOT_KEY]?: boolean };

function normalizeGalenLabels() {
  document.querySelectorAll('button, h3, p, span, div').forEach((node) => {
    if (node.children.length > 0) return;
    const text = node.textContent || '';
    if (!text.includes('Ollama')) return;
    node.textContent = text
      .replace(/Ollama OS AI App/g, 'Galen Shell AI')
      .replace(/Open Ollama AI/g, 'Open Galen AI')
      .replace(/Ollama is staged as the local Olympus Core OS AI runtime/g, 'Galen is staged as the local Olympus shell AI inside the Desk window')
      .replace(/Ollama/g, 'Galen');
  });
  document.querySelectorAll<HTMLElement>('[title="Ollama"]').forEach((node) => node.setAttribute('title', 'Galen'));
}

function findGalenDockButton(target: HTMLElement | null) {
  const button = target?.closest('button') as HTMLElement | null;
  if (!button) return null;
  const text = `${button.textContent || ''} ${button.getAttribute('title') || ''}`.toLowerCase();
  if (text.includes('galen') || text.includes('ollama')) return button;
  return null;
}

function openGalenShell() {
  localStorage.setItem(VIEW_KEY, 'ollama');
  localStorage.setItem('olympus.ai.modelName', 'Galen');
  localStorage.setItem('olympus.ai.displayName', 'Galen');
  window.dispatchEvent(new CustomEvent('olympus:galen-shell-open'));
  window.setTimeout(normalizeGalenLabels, 60);
  window.setTimeout(normalizeGalenLabels, 250);
}

if (typeof window !== 'undefined') {
  const scopedWindow = window as ScopedWindow;
  if (!scopedWindow[BOOT_KEY]) {
    scopedWindow[BOOT_KEY] = true;
    document.addEventListener('click', (event) => {
      const button = findGalenDockButton(event.target as HTMLElement | null);
      if (!button) return;
      openGalenShell();
    }, true);
    window.setInterval(normalizeGalenLabels, 800);
  }
}
