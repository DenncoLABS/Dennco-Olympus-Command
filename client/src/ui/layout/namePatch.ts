const BOOT_KEY = '__olympusNamePatchReady';
const OLD_NAME = ['Ol', 'lama'].join('');
const NEW_NAME = 'Galen';

type ScopedWindow = Window & { [BOOT_KEY]?: boolean };

function updateNode(node: Element) {
  if (!node.textContent || !node.textContent.includes(OLD_NAME)) return;
  if (node.children.length > 0) return;
  node.textContent = node.textContent.split(OLD_NAME).join(NEW_NAME);
}

function run() {
  localStorage.setItem('olympus.modelName', NEW_NAME);
  localStorage.setItem('olympus.displayName', NEW_NAME);
  document.querySelectorAll('button, h3, p, span, div').forEach(updateNode);
}

if (typeof window !== 'undefined') {
  const scopedWindow = window as ScopedWindow;
  if (!scopedWindow[BOOT_KEY]) {
    scopedWindow[BOOT_KEY] = true;
    window.setInterval(run, 900);
  }
}
