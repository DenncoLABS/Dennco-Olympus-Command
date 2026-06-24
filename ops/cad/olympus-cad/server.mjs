import http from 'node:http';

const port = Number(process.env.PORT || 5050);
const orgName = process.env.OLYMPUS_CAD_DEFAULT_ORG || 'Olympus Command';
const rows = [
  ['CAD-1001', 'Service Request', 'Normal', 'Open', 'Unit-1'],
  ['CAD-1002', 'Road Event', 'Review', 'Queued', 'Unassigned'],
];

function send(res, status, type, body) {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

function render() {
  const tableRows = rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('');
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Olympus CAD</title>
<style>
body{margin:0;background:#05070b;color:#dbeafe;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}header{height:58px;display:flex;align-items:center;justify-content:space-between;padding:0 22px;border-bottom:1px solid rgba(0,229,255,.28);background:rgba(0,0,0,.45)}.k{color:#22d3ee;font-size:10px;letter-spacing:.24em;text-transform:uppercase}h1{margin:4px 0 0;font-size:20px;letter-spacing:.18em;text-transform:uppercase}main{padding:22px;display:grid;gap:18px}.panel{border:1px solid rgba(0,229,255,.25);background:rgba(15,23,42,.55)}h2{margin:0;padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.08);font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:#67e8f9}table{width:100%;border-collapse:collapse;font-size:12px}th,td{text-align:left;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.07)}th{color:rgba(255,255,255,.45);text-transform:uppercase;font-size:10px;letter-spacing:.16em}.note{padding:16px;color:rgba(255,255,255,.55);font-size:12px;line-height:1.65}
</style>
</head>
<body>
<header><div><div class="k">${orgName} / Computer-Aided Dispatch</div><h1>Olympus CAD</h1></div><div class="k">Authenticated by Olympus</div></header>
<main>
<section class="panel"><h2>Local CAD Queue</h2><table><thead><tr><th>Item</th><th>Type</th><th>Priority</th><th>Status</th><th>Unit</th></tr></thead><tbody>${tableRows}</tbody></table></section>
<section class="panel"><h2>Integration</h2><div class="note">This local CAD surface is reached only through the Olympus protected /cad/ route. It does not present its own login screen. When the DenncoLABS Resgrid repository is populated, this same service path can be switched to the full Resgrid runtime without changing the Olympus CAD navigation.</div></section>
</main>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/health') return send(res, 200, 'application/json', JSON.stringify({ ok: true }));
  return send(res, 200, 'text/html; charset=utf-8', render());
});

server.listen(port, '0.0.0.0', () => console.log(`Olympus CAD listening on ${port}`));
