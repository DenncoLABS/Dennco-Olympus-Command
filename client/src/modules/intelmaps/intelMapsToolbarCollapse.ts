const BOOT_KEY = '__olympusIntelMapsToolbarCollapseReady';

type ScopedWindow = Window & { [BOOT_KEY]?: boolean };

function installStyles() {
  if (document.getElementById('olympus-intel-maps-toolbar-collapse-style')) return;
  const style = document.createElement('style');
  style.id = 'olympus-intel-maps-toolbar-collapse-style';
  style.textContent = `
    .olympus-mp-toolbar{
      transition:height .22s ease, opacity .22s ease, transform .22s ease, padding .22s ease, border-color .22s ease;
      overflow:hidden!important;
    }
    .olympus-mp-toolbar[data-collapsed='true']{
      height:13px!important;
      min-height:13px!important;
      padding-top:0!important;
      padding-bottom:0!important;
      opacity:.28!important;
      transform:translateY(-6px)!important;
      border-color:rgba(34,211,238,.16)!important;
    }
    .olympus-mp-toolbar[data-collapsed='true'] > *{
      opacity:0!important;
      pointer-events:none!important;
    }
    .olympus-mp-toolbar[data-collapsed='false'],
    .olympus-mp-toolbar:hover,
    .olympus-mp-toolbar:focus-within{
      height:auto!important;
      min-height:0!important;
      opacity:1!important;
      transform:none!important;
    }
    .olympus-mp-toolbar:hover > *,
    .olympus-mp-toolbar:focus-within > *,
    .olympus-mp-toolbar[data-collapsed='false'] > *{
      opacity:1!important;
      pointer-events:auto!important;
    }
    .olympus-mp-workspace{
      padding-top:8px!important;
    }
    .olympus-mp-workspace > section[data-olympus-map-window='true']{
      max-height:calc(100vh - 160px)!important;
    }
  `;
  document.head.appendChild(style);
}

function findToolbar() {
  const nodes = Array.from(document.querySelectorAll('div'));
  const label = nodes.find((node) => node.textContent?.includes('MULTI-PURPOSE EARTH WORKSPACE'));
  return label?.closest('div.absolute.left-4.top-4.right-4') as HTMLElement | null;
}

function markMapWindows(workspace: Element | null) {
  if (!workspace) return;
  const windows = Array.from(workspace.children).filter((node): node is HTMLElement => {
    if (!(node instanceof HTMLElement)) return false;
    return node.tagName === 'SECTION' && node.style.position !== 'static';
  });

  windows.forEach((win) => {
    win.dataset.olympusMapWindow = 'true';
    if (win.dataset.olympusToolbarReclaimed === 'true') return;
    const currentTop = Number.parseFloat(win.style.top || '0');
    if (Number.isFinite(currentTop)) {
      win.style.top = `${Math.max(8, currentTop - 56)}px`;
    }
    const currentHeight = Number.parseFloat(win.style.height || '0');
    if (Number.isFinite(currentHeight) && currentHeight > 0) {
      win.style.height = `${Math.min(window.innerHeight - 160, currentHeight + 44)}px`;
    }
    win.dataset.olympusToolbarReclaimed = 'true';
  });
}

function bindToolbar(toolbar: HTMLElement) {
  if (toolbar.dataset.olympusToolbarBound === 'true') return;
  toolbar.dataset.olympusToolbarBound = 'true';
  toolbar.classList.add('olympus-mp-toolbar');
  toolbar.dataset.collapsed = 'false';

  const workspace = toolbar.nextElementSibling;
  workspace?.classList.add('olympus-mp-workspace');

  let timer = window.setTimeout(() => {
    toolbar.dataset.collapsed = 'true';
  }, 2200);

  const expand = () => {
    window.clearTimeout(timer);
    toolbar.dataset.collapsed = 'false';
  };
  const scheduleCollapse = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      toolbar.dataset.collapsed = 'true';
    }, 1800);
  };

  toolbar.addEventListener('mouseenter', expand);
  toolbar.addEventListener('focusin', expand);
  toolbar.addEventListener('mouseleave', scheduleCollapse);
  toolbar.addEventListener('focusout', scheduleCollapse);
}

function tick() {
  const toolbar = findToolbar();
  if (!toolbar) return;
  installStyles();
  bindToolbar(toolbar);
  markMapWindows(toolbar.nextElementSibling);
}

if (typeof window !== 'undefined') {
  const scopedWindow = window as ScopedWindow;
  if (!scopedWindow[BOOT_KEY]) {
    scopedWindow[BOOT_KEY] = true;
    window.setInterval(tick, 350);
    window.addEventListener('resize', tick);
  }
}
