const BOOT_KEY = '__olympusDockLogoutConfirmReady';
const POPUP_ID = 'olympus-logout-confirm-popup';

type ScopedWindow = Window & { [BOOT_KEY]?: boolean; __olympusLogoutBypass?: boolean };

let pendingLogoutTarget: HTMLElement | null = null;
let confirmStage: 1 | 2 = 1;

function textFor(node: HTMLElement) {
  return [
    node.textContent || '',
    node.getAttribute('aria-label') || '',
    node.getAttribute('title') || '',
    node.getAttribute('data-tooltip') || '',
  ].join(' ').toLowerCase();
}

function isLogoutTrigger(node: HTMLElement | null) {
  const trigger = node?.closest('button, a, [role="button"], [data-dock-action], [data-action]') as HTMLElement | null;
  if (!trigger || trigger.closest(`#${POPUP_ID}`)) return null;
  const text = textFor(trigger);
  const action = `${trigger.getAttribute('data-dock-action') || ''} ${trigger.getAttribute('data-action') || ''}`.toLowerCase();
  if (text.includes('log out') || text.includes('logout') || action.includes('logout') || action.includes('log-out')) return trigger;
  return null;
}

function removePopup() {
  document.getElementById(POPUP_ID)?.remove();
  pendingLogoutTarget = null;
  confirmStage = 1;
}

function finishLogout() {
  const target = pendingLogoutTarget;
  removePopup();
  if (!target) return;
  const scopedWindow = window as ScopedWindow;
  scopedWindow.__olympusLogoutBypass = true;
  window.setTimeout(() => {
    target.click();
    window.setTimeout(() => { scopedWindow.__olympusLogoutBypass = false; }, 250);
  }, 0);
}

function renderPopup() {
  document.getElementById(POPUP_ID)?.remove();
  const overlay = document.createElement('div');
  overlay.id = POPUP_ID;
  overlay.setAttribute('data-olympus-logout-popup', 'true');
  overlay.innerHTML = confirmStage === 1 ? `
    <div class="fixed inset-0 z-[99999] grid place-items-center bg-black/65 backdrop-blur-sm">
      <section class="w-[460px] overflow-hidden rounded-lg border border-cyan-300/25 bg-[#05070b] text-white shadow-[0_24px_90px_rgba(0,0,0,.8)]">
        <div class="flex h-10 items-center justify-between border-b border-cyan-300/15 bg-black/70 px-3">
          <div class="text-[10px] uppercase tracking-[0.24em] text-cyan-300">Close Session</div>
          <button data-logout-cancel="true" class="grid h-7 w-7 place-items-center rounded border border-white/10 text-white/55 hover:border-cyan-300/40 hover:text-cyan-200">×</button>
        </div>
        <div class="p-5 text-center">
          <div class="mx-auto grid h-16 w-16 place-items-center rounded-full border border-cyan-300/30 bg-cyan-300/10 text-3xl text-cyan-100">⏻</div>
          <div class="mt-4 text-lg font-bold text-white">Are you sure you want to log-out?</div>
          <div class="mt-2 text-sm leading-relaxed text-white/55">Olympus will close this session if you continue.</div>
          <div class="mt-5 flex justify-center gap-3">
            <button data-logout-cancel="true" class="rounded border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.16em] text-white/60 hover:border-cyan-300/40 hover:text-cyan-200">No</button>
            <button data-logout-next="true" class="rounded border border-cyan-300/35 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.16em] text-cyan-100 hover:bg-cyan-300/20">Yes, continue</button>
          </div>
        </div>
      </section>
    </div>` : `
    <div class="fixed inset-0 z-[99999] grid place-items-center bg-black/75 backdrop-blur-sm">
      <section class="w-[520px] overflow-hidden rounded-lg border border-red-500/40 bg-[#090305] text-white shadow-[0_24px_100px_rgba(127,29,29,.45)]">
        <div class="flex h-10 items-center justify-between border-b border-red-500/25 bg-black/75 px-3">
          <div class="text-[10px] uppercase tracking-[0.24em] text-red-200">Final Logout Confirmation</div>
          <button data-logout-cancel="true" class="grid h-7 w-7 place-items-center rounded border border-white/10 text-white/55 hover:border-red-300/50 hover:text-red-100">×</button>
        </div>
        <div class="p-6 text-center">
          <button data-logout-final="true" class="mx-auto grid h-36 w-36 place-items-center rounded-full border border-red-300/70 bg-red-600/85 text-6xl text-white shadow-[0_0_55px_rgba(239,68,68,.55)] transition hover:scale-105 hover:bg-red-500">⏻</button>
          <div class="mt-5 text-xl font-bold uppercase tracking-[0.12em] text-red-100">Press here to close session</div>
          <div class="mt-2 text-sm leading-relaxed text-white/55">This is the second confirmation. Press the red power button to log out, or use the toolbar × to bypass and keep working.</div>
          <button data-logout-cancel="true" class="mt-5 rounded border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.16em] text-white/60 hover:border-red-300/40 hover:text-red-100">Cancel</button>
        </div>
      </section>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelectorAll('[data-logout-cancel="true"]').forEach((node) => node.addEventListener('click', removePopup));
  overlay.querySelector('[data-logout-next="true"]')?.addEventListener('click', () => { confirmStage = 2; renderPopup(); });
  overlay.querySelector('[data-logout-final="true"]')?.addEventListener('click', finishLogout);
}

function startLogoutConfirm(target: HTMLElement) {
  pendingLogoutTarget = target;
  confirmStage = 1;
  renderPopup();
}

if (typeof window !== 'undefined') {
  const scopedWindow = window as ScopedWindow;
  if (!scopedWindow[BOOT_KEY]) {
    scopedWindow[BOOT_KEY] = true;
    document.addEventListener('click', (event) => {
      if (scopedWindow.__olympusLogoutBypass) return;
      const trigger = isLogoutTrigger(event.target as HTMLElement | null);
      if (!trigger) return;
      event.preventDefault();
      event.stopPropagation();
      startLogoutConfirm(trigger);
    }, true);
  }
}
