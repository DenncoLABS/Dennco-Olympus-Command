const BOOT_KEY = '__olympusIntelMapsToolbarCollapseReady';

type ScopedWindow = Window & { [BOOT_KEY]?: boolean };

function installStyles() {
  if (document.getElementById('olympus-intel-maps-toolbar-collapse-style')) return;
  const style = document.createElement('style');
  style.id = 'olympus-intel-maps-toolbar-collapse-style';
  style.textContent = `
    .olympus-mp-toolbar{
      transition:height .18s ease, min-height .18s ease, opacity .18s ease, transform .18s ease, padding .18s ease, border-color .18s ease, background-color .18s ease;
      overflow:hidden!important;
    }
    .olympus-mp-toolbar::after{
      content:'INTEL MAPS TOOLBAR · HOVER TO EXPAND';
      position:absolute;
      left:50%;
      top:1px;
      transform:translateX(-50%);
      display:none;
      font:700 8px/1.1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      letter-spacing:.24em;
      color:rgba(103,232,249,.72);
      pointer-events:none;
      white-space:nowrap;
    }
    .olympus-mp-toolbar[data-collapsed='true']{
      height:10px!important;
      min-height:10px!important;
      padding-top:0!important;
      padding-bottom:0!important;
      opacity:.34!important;
      transform:translateY(-8px)!important;
      border-color:rgba(34,211,238,.18)!important;
      background-color:rgba(0,0,0,.72)!important;
      cursor:pointer!important;
    }
    .olympus-mp-toolbar[data-collapsed='true']::after{
      display:block;
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
      cursor:auto!important;
    }
    .olympus-mp-toolbar:hover::after,
    .olympus-mp-toolbar:focus-within::after,
    .olympus-mp-toolbar[data-collapsed='false']::after{
      display:none;
    }
    .olympus-mp-toolbar:hover > *,
    .olympus-mp-toolbar:focus-within > *,
    .olympus-mp-toolbar[data-collapsed='false'] > *{
      opacity:1!important;
      pointer-events:auto!important;
    }
    .olympus-mp-workspace{
      padding-top:2px!important;
    }
    .olympus-mp-workspace > section[data-olympus-map-window='true']{
      max-height:calc(100vh - 112px)!important;
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
      win.style.top = `${Math.max(4, currentTop - 72)}px`;
    }
    const currentHeight = Number.parseFloat(win.style.height || '0');
    if (Number.isFinite(currentHeight) && currentHeight > 0) {
      win.style.height = `${Math.min(window.innerHeight - 112, currentHeight + 64)}px`;
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
  }, 1200);

  const expand = () => {
    window.clearTimeout(timer);
    toolbar.dataset.collapsed = 'false';
  };
  const scheduleCollapse = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      toolbar.dataset.collapsed = 'true';
    }, 950);
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
