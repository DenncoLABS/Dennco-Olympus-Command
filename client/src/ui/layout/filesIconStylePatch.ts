const BOOT_KEY = '__olympusFilesIconStyleReady';

type ScopedWindow = Window & { [BOOT_KEY]?: boolean };

function installStyle() {
  if (document.getElementById('olympus-files-icon-style')) return;
  const style = document.createElement('style');
  style.id = 'olympus-files-icon-style';
  style.textContent = `
    [data-files-browser-root="true"]{background:#111315!important;border-radius:10px!important;overflow:hidden!important;}
    [data-files-browser-root="true"] > div:first-child{height:48px!important;padding:8px 12px!important;background:rgba(255,255,255,.055)!important;border-bottom:1px solid rgba(255,255,255,.10)!important;}
    [data-files-browser-root="true"] > div:first-child > div:first-child{display:none!important;}
    [data-files-browser-root="true"] > div:first-child > div:last-child{width:100%!important;display:flex!important;gap:8px!important;}
    [data-files-path="true"]{flex:1!important;height:32px!important;border-radius:7px!important;background:rgba(0,0,0,.34)!important;border:1px solid rgba(255,255,255,.10)!important;}
    [data-files-list="true"]{display:block!important;height:100%!important;border:0!important;background:#0b0d10!important;padding:18px!important;}
    [data-files-list="true"] > button{display:inline-flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;width:132px!important;height:126px!important;margin:10px!important;border:0!important;border-radius:10px!important;background:transparent!important;text-align:center!important;vertical-align:top!important;}
    [data-files-list="true"] > button:hover{background:rgba(34,211,238,.10)!important;}
    [data-files-list="true"] > button span:first-child{display:flex!important;flex-direction:column!important;align-items:center!important;gap:8px!important;font-size:13px!important;color:rgba(255,255,255,.82)!important;max-width:110px!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;}
    [data-files-list="true"] > button span:first-child::before{content:'▣';display:grid;place-items:center;width:72px;height:58px;border-radius:12px;background:linear-gradient(180deg,rgba(207,250,254,.86),rgba(103,232,249,.44));color:#041014;font-size:30px;box-shadow:0 0 18px rgba(34,211,238,.16);}
    [data-files-list="true"] > button[data-open-type="file"] span:first-child::before{content:'□';}
    [data-files-list="true"] > button span:last-child,[data-files-list="true"] > button > div:nth-child(2){display:none!important;}
    [data-files-preview="true"]{display:none!important;}
  `;
  document.head.appendChild(style);
}

if (typeof window !== 'undefined') {
  const scopedWindow = window as ScopedWindow;
  if (!scopedWindow[BOOT_KEY]) {
    scopedWindow[BOOT_KEY] = true;
    window.setInterval(installStyle, 500);
  }
}
