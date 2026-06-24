import http from 'node:http';

const port = Number(process.env.PORT || 5050);
const orgName = process.env.OLYMPUS_CAD_DEFAULT_ORG || 'Olympus Command';

const calls = [
  { id: 'CAD-1001', type: 'Service Request', priority: 'Normal', status: 'Open', unit: 'Unit-1', location: 'Operations Desk' },
  { id: 'CAD-1002', type: 'Road Event', priority: 'Review', status: 'Queued', unit: 'Unassigned', location: 'Pending geocode' },
];

function send(res, status, type, body) {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch { resolve({}); }
    });
  });
}

function render() {
  const tableRows = calls.map((call) => `<tr>
    <td>${call.id}</td>
    <td>${call.type}</td>
    <td>${call.priority}</td>
    <td><select onchange="updateCall('${call.id}', { status: this.value })"><option ${call.status === 'Queued' ? 'selected' : ''}>Queued</option><option ${call.status === 'Open' ? 'selected' : ''}>Open</option><option ${call.status === 'Dispatched' ? 'selected' : ''}>Dispatched</option><option ${call.status === 'Closed' ? 'selected' : ''}>Closed</option></select></td>
    <td><input value="${call.unit}" onchange="updateCall('${call.id}', { unit: this.value })" /></td>
    <td>${call.location}</td>
    <td><button onclick="updateCall('${call.id}', { status: 'Closed' })">Close</button></td>
  </tr>`).join('');

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Olympus CAD</title>
<style>
:root{color-scheme:dark}body{margin:0;background:#05070b;color:#dbeafe;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}main{padding:18px;display:grid;gap:16px}.panel{border:1px solid rgba(0,229,255,.25);background:rgba(15,23,42,.55)}.bar{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.08)}h2{margin:0;font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:#67e8f9}.k{color:#22d3ee;font-size:10px;letter-spacing:.22em;text-transform:uppercase}.toolbar{display:flex;gap:10px;align-items:center}button{border:1px solid rgba(0,229,255,.4);background:rgba(0,229,255,.08);color:#67e8f9;padding:7px 10px;text-transform:uppercase;letter-spacing:.12em;font-family:inherit;font-size:11px;cursor:pointer}button:hover{background:rgba(0,229,255,.16)}table{width:100%;border-collapse:collapse;font-size:12px}th,td{text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.07)}th{color:rgba(255,255,255,.45);text-transform:uppercase;font-size:10px;letter-spacing:.16em}input,select{background:#020617;border:1px solid rgba(255,255,255,.14);color:#dbeafe;padding:6px 8px;font-family:inherit;font-size:12px}.note{padding:14px;color:rgba(255,255,255,.55);font-size:12px;line-height:1.65}.form{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;padding:14px}.form input,.form select{width:100%;box-sizing:border-box}.muted{color:rgba(255,255,255,.4)}
</style>
</head>
<body>
<main>
<section class="panel">
  <div class="bar"><div><div class="k">${orgName}</div><h2>Dispatch Queue</h2></div><div class="k">Authenticated by Olympus</div></div>
  <div class="form">
    <input id="type" placeholder="Call type" value="Service Request" />
    <select id="priority"><option>Normal</option><option>Review</option><option>High</option><option>Critical</option></select>
    <input id="location" placeholder="Location" value="Pending geocode" />
    <input id="unit" placeholder="Unit" value="Unassigned" />
    <button onclick="createCall()">Create Call</button>
  </div>
  <table><thead><tr><th>Item</th><th>Type</th><th>Priority</th><th>Status</th><th>Unit</th><th>Location</th><th>Action</th></tr></thead><tbody>${tableRows}</tbody></table>
</section>
<section class="panel"><div class="bar"><h2>Integration</h2><span class="muted">Olympus-owned CAD service</span></div><div class="note">This CAD surface is reached through the Olympus protected /cad/ route and does not expose a separate login. The service path can later be switched to the full Resgrid runtime without changing Olympus navigation.</div></section>
</main>
<script>
async function createCall(){
  await fetch('/api/calls', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({type:document.getElementById('type').value, priority:document.getElementById('priority').value, location:document.getElementById('location').value, unit:document.getElementById('unit').value})});
  location.reload();
}
async function updateCall(id, patch){
  await fetch('/api/calls/'+id, {method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(patch)});
  location.reload();
}
</script>
</body>
</html>`;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/health') return send(res, 200, 'application/json', JSON.stringify({ ok: true }));
  if (url.pathname === '/api/calls' && req.method === 'GET') return send(res, 200, 'application/json', JSON.stringify({ calls }));
  if (url.pathname === '/api/calls' && req.method === 'POST') {
    const body = await readBody(req);
    const next = { id: `CAD-${Math.floor(1000 + Math.random() * 9000)}`, type: body.type || 'Service Request', priority: body.priority || 'Normal', status: 'Queued', unit: body.unit || 'Unassigned', location: body.location || 'Pending geocode' };
    calls.unshift(next);
    return send(res, 200, 'application/json', JSON.stringify({ ok: true, call: next }));
  }
  const match = url.pathname.match(/^\/api\/calls\/([^/]+)$/);
  if (match && req.method === 'PATCH') {
    const body = await readBody(req);
    const call = calls.find((item) => item.id === match[1]);
    if (!call) return send(res, 404, 'application/json', JSON.stringify({ error: 'not_found' }));
    if (typeof body.status === 'string') call.status = body.status;
    if (typeof body.unit === 'string') call.unit = body.unit;
    if (typeof body.priority === 'string') call.priority = body.priority;
    if (typeof body.location === 'string') call.location = body.location;
    return send(res, 200, 'application/json', JSON.stringify({ ok: true, call }));
  }
  return send(res, 200, 'text/html; charset=utf-8', render());
});

server.listen(port, '0.0.0.0', () => console.log(`Olympus CAD listening on ${port}`));
