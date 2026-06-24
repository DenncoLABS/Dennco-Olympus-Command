import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const port = Number(process.env.PORT || 5050);
const orgName = process.env.OLYMPUS_CAD_DEFAULT_ORG || 'Olympus Command';
const dataDir = process.env.OLYMPUS_CAD_DATA_DIR || '/var/lib/dennco/olympus-cad';
const dataFile = path.join(dataDir, 'cad-state.json');

const defaultState = {
  calls: [
    { id: 'CAD-1001', type: 'Service Request', priority: 'Normal', status: 'Open', unit: 'Unit-1', location: 'Operations Desk' },
    { id: 'CAD-1002', type: 'Road Event', priority: 'Review', status: 'Queued', unit: 'Unassigned', location: 'Pending geocode' },
  ],
  personnel: [
    { id: 'P-101', name: 'Dispatcher 1', role: 'Dispatcher', status: 'Available', station: 'Olympus Desk' },
    { id: 'P-102', name: 'Supervisor', role: 'Supervisor', status: 'Monitoring', station: 'Command' },
  ],
  units: [
    { id: 'Unit-1', type: 'Patrol', status: 'Available', location: 'Operations Desk' },
    { id: 'Unit-2', type: 'Response', status: 'Standby', location: 'Staging' },
  ],
  shifts: [
    { id: 'S-1', name: 'Day Watch', time: '0700-1900', lead: 'Supervisor' },
    { id: 'S-2', name: 'Night Watch', time: '1900-0700', lead: 'Dispatcher 1' },
  ],
  logs: [{ id: 'L-1', time: new Date().toISOString(), event: 'CAD service online', actor: 'System' }],
  reports: [{ id: 'R-1', title: 'Daily Activity Summary', status: 'Draft', owner: 'Command' }],
  documents: [{ id: 'D-1', title: 'SOP - Dispatch Operations', status: 'Published', type: 'Policy' }],
  calendar: [{ id: 'C-1', title: 'Shift Briefing', when: 'Daily 0700', owner: 'Command' }],
  notes: [{ id: 'N-1', title: 'Watch Notes', body: 'Review open calls and unit status at shift change.' }],
  trainings: [{ id: 'T-1', title: 'CAD Orientation', status: 'Assigned', audience: 'All operators' }],
  inventory: [
    { id: 'I-1', item: 'Radio Console', status: 'Operational', assigned: 'Dispatch' },
    { id: 'I-2', item: 'Mobile Terminal', status: 'Ready', assigned: 'Unit-1' },
  ],
};

function loadState() {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(dataFile)) {
      fs.writeFileSync(dataFile, JSON.stringify(defaultState, null, 2));
      return structuredClone(defaultState);
    }
    const parsed = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    return { ...structuredClone(defaultState), ...parsed };
  } catch (error) {
    console.error('[Olympus CAD] Failed to load state:', error);
    return structuredClone(defaultState);
  }
}

function saveState() {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(dataFile, JSON.stringify(state, null, 2));
  } catch (error) {
    console.error('[Olympus CAD] Failed to save state:', error);
  }
}

const state = loadState();

const modules = ['Personnel', 'Calls', 'Units', 'Mapping', 'Shifts', 'Logs', 'Reports', 'Documents', 'Calendar', 'Notes', 'Trainings', 'Inventory'];
const unitStatuses = ['Available', 'Standby', 'Assigned', 'En Route', 'On Scene', 'Out of Service'];
const personnelStatuses = ['Available', 'Monitoring', 'Busy', 'Off Duty'];

function send(res, status, type, body) {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

function safe(value) {
  return String(value ?? '').replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]);
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

function logEvent(event, actor = 'Operator') {
  state.logs.unshift({ id: `L-${Date.now()}`, time: new Date().toISOString(), event, actor });
  state.logs = state.logs.slice(0, 200);
  saveState();
}

function row(cells) {
  return `<tr>${cells.map((cell) => `<td>${cell}</td>`).join('')}</tr>`;
}

function simpleRows(items, keys) {
  return items.map((item) => row(keys.map((key) => safe(item[key])))).join('');
}

function options(values, current) {
  return values.map((value) => `<option ${value === current ? 'selected' : ''}>${safe(value)}</option>`).join('');
}

function renderTable(title, subtitle, headers, bodyRows) {
  return `<section class="panel"><div class="bar"><div><div class="k">${safe(subtitle)}</div><h2>${safe(title)}</h2></div></div><table><thead><tr>${headers.map((h) => `<th>${safe(h)}</th>`).join('')}</tr></thead><tbody>${bodyRows}</tbody></table></section>`;
}

function render() {
  const moduleTiles = modules.map((module) => `<button class="module" onclick="document.getElementById('${module.toLowerCase()}').scrollIntoView({behavior:'smooth'})">${module}</button>`).join('');
  const callRows = state.calls.map((call) => `<tr><td>${safe(call.id)}</td><td>${safe(call.type)}</td><td>${safe(call.priority)}</td><td><select onchange="updateCall('${safe(call.id)}', { status: this.value })">${options(['Queued', 'Open', 'Dispatched', 'Closed'], call.status)}</select></td><td><input value="${safe(call.unit)}" onchange="updateCall('${safe(call.id)}', { unit: this.value })" /></td><td>${safe(call.location)}</td><td><button onclick="updateCall('${safe(call.id)}', { status: 'Closed' })">Close</button></td></tr>`).join('');
  const unitRows = state.units.map((unit) => `<tr><td>${safe(unit.id)}</td><td>${safe(unit.type)}</td><td><select onchange="updateUnit('${safe(unit.id)}', { status: this.value })">${options(unitStatuses, unit.status)}</select></td><td><input value="${safe(unit.location)}" onchange="updateUnit('${safe(unit.id)}', { location: this.value })" /></td></tr>`).join('');
  const personnelRows = state.personnel.map((person) => `<tr><td>${safe(person.id)}</td><td>${safe(person.name)}</td><td>${safe(person.role)}</td><td><select onchange="updatePersonnel('${safe(person.id)}', { status: this.value })">${options(personnelStatuses, person.status)}</select></td><td><input value="${safe(person.station)}" onchange="updatePersonnel('${safe(person.id)}', { station: this.value })" /></td></tr>`).join('');

  return `<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Olympus CAD</title><style>:root{color-scheme:dark}body{margin:0;background:#05070b;color:#dbeafe;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}main{padding:18px;display:grid;gap:16px}.panel{border:1px solid rgba(0,229,255,.25);background:rgba(15,23,42,.55)}.bar{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.08)}h1{margin:0;font-size:20px;letter-spacing:.16em;text-transform:uppercase;color:#e0f2fe}h2{margin:0;font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:#67e8f9}.k{color:#22d3ee;font-size:10px;letter-spacing:.22em;text-transform:uppercase}.modules{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;padding:14px}.module{text-align:left}button{border:1px solid rgba(0,229,255,.4);background:rgba(0,229,255,.08);color:#67e8f9;padding:7px 10px;text-transform:uppercase;letter-spacing:.12em;font-family:inherit;font-size:11px;cursor:pointer}button:hover{background:rgba(0,229,255,.16)}table{width:100%;border-collapse:collapse;font-size:12px}th,td{text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.07)}th{color:rgba(255,255,255,.45);text-transform:uppercase;font-size:10px;letter-spacing:.16em}input,select{background:#020617;border:1px solid rgba(255,255,255,.14);color:#dbeafe;padding:6px 8px;font-family:inherit;font-size:12px}.note{padding:14px;color:rgba(255,255,255,.55);font-size:12px;line-height:1.65}.form{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;padding:14px}.form input,.form select{width:100%;box-sizing:border-box}.muted{color:rgba(255,255,255,.4)}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px}.mapbox{height:240px;margin:14px;border:1px solid rgba(255,255,255,.12);background:radial-gradient(circle at 30% 40%,rgba(0,229,255,.18),transparent 25%),linear-gradient(135deg,rgba(14,165,233,.08),rgba(2,6,23,.9));position:relative}.pin{position:absolute;width:8px;height:8px;border-radius:50%;background:#67e8f9;box-shadow:0 0 14px #67e8f9}.pin.a{left:30%;top:46%}.pin.b{left:58%;top:36%}.pin.c{left:66%;top:62%}@media(max-width:900px){.form{grid-template-columns:1fr}.grid2{grid-template-columns:1fr}}</style></head><body><main><section class="panel"><div class="bar"><div><div class="k">${safe(orgName)}</div><h1>Olympus CAD Core</h1></div><div class="k">Persistent Local CAD</div></div><div class="modules">${moduleTiles}</div></section><section id="calls" class="panel"><div class="bar"><div><div class="k">Computer Aided Dispatch</div><h2>Calls</h2></div><span class="muted">Dispatch queue</span></div><div class="form"><input id="type" placeholder="Call type" value="Service Request" /><select id="priority"><option>Normal</option><option>Review</option><option>High</option><option>Critical</option></select><input id="location" placeholder="Location" value="Pending geocode" /><input id="unit" placeholder="Unit" value="Unassigned" /><button onclick="createCall()">Create Call</button></div><table><thead><tr><th>Item</th><th>Type</th><th>Priority</th><th>Status</th><th>Unit</th><th>Location</th><th>Action</th></tr></thead><tbody>${callRows}</tbody></table></section><div class="grid2"><div id="personnel">${renderTable('Personnel','Responders and operators',['ID','Name','Role','Status','Station'],personnelRows)}</div><div id="units">${renderTable('Units','Unit status board',['ID','Type','Status','Location'],unitRows)}</div></div><section id="mapping" class="panel"><div class="bar"><div><div class="k">Operational map</div><h2>Mapping</h2></div><span class="muted">Static CAD map preview</span></div><div class="mapbox"><div class="pin a"></div><div class="pin b"></div><div class="pin c"></div></section><div class="grid2"><div id="shifts">${renderTable('Shifts','Schedules',['ID','Name','Time','Lead'],simpleRows(state.shifts,['id','name','time','lead']))}</div><div id="logs">${renderTable('Logs','Audit trail',['ID','Time','Event','Actor'],simpleRows(state.logs,['id','time','event','actor']))}</div><div id="reports">${renderTable('Reports','Operational reporting',['ID','Title','Status','Owner'],simpleRows(state.reports,['id','title','status','owner']))}</div><div id="documents">${renderTable('Documents','Files and policies',['ID','Title','Type','Status'],simpleRows(state.documents,['id','title','type','status']))}</div><div id="calendar">${renderTable('Calendar','Events',['ID','Title','When','Owner'],simpleRows(state.calendar,['id','title','when','owner']))}</div><div id="trainings">${renderTable('Trainings','Assignments',['ID','Title','Status','Audience'],simpleRows(state.trainings,['id','title','status','audience']))}</div><div id="inventory">${renderTable('Inventory','Equipment',['ID','Item','Status','Assigned'],simpleRows(state.inventory,['id','item','status','assigned']))}</div><section id="notes" class="panel"><div class="bar"><div><div class="k">Operator notes</div><h2>Notes</h2></div></div><div class="note">${state.notes.map((n) => `<strong>${safe(n.title)}</strong><br/>${safe(n.body)}`).join('<hr/>')}</div></section></div><section class="panel"><div class="bar"><h2>Integration</h2><span class="muted">Olympus-owned CAD service</span></div><div class="note">This CAD surface is reached through the Olympus protected /cad/ route and now stores local CAD state under ${safe(dataDir)}.</div></section></main><script>async function createCall(){await fetch('/api/calls',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:document.getElementById('type').value,priority:document.getElementById('priority').value,location:document.getElementById('location').value,unit:document.getElementById('unit').value})});location.reload()}async function updateCall(id,patch){await fetch('/api/calls/'+id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(patch)});location.reload()}async function updateUnit(id,patch){await fetch('/api/units/'+id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(patch)});location.reload()}async function updatePersonnel(id,patch){await fetch('/api/personnel/'+id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(patch)});location.reload()}</script></body></html>`;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/health') return send(res, 200, 'application/json', JSON.stringify({ ok: true, persistent: true, dataFile }));
  if (url.pathname === '/api/calls' && req.method === 'GET') return send(res, 200, 'application/json', JSON.stringify({ calls: state.calls }));
  if (url.pathname === '/api/personnel' && req.method === 'GET') return send(res, 200, 'application/json', JSON.stringify({ personnel: state.personnel }));
  if (url.pathname === '/api/units' && req.method === 'GET') return send(res, 200, 'application/json', JSON.stringify({ units: state.units }));
  if (url.pathname === '/api/modules' && req.method === 'GET') return send(res, 200, 'application/json', JSON.stringify({ modules }));
  if (url.pathname === '/api/calls' && req.method === 'POST') {
    const body = await readBody(req);
    const next = { id: `CAD-${Math.floor(1000 + Math.random() * 9000)}`, type: body.type || 'Service Request', priority: body.priority || 'Normal', status: 'Queued', unit: body.unit || 'Unassigned', location: body.location || 'Pending geocode' };
    state.calls.unshift(next);
    logEvent(`Created call ${next.id}`);
    return send(res, 200, 'application/json', JSON.stringify({ ok: true, call: next }));
  }
  let match = url.pathname.match(/^\/api\/calls\/([^/]+)$/);
  if (match && req.method === 'PATCH') {
    const body = await readBody(req);
    const call = state.calls.find((item) => item.id === match[1]);
    if (!call) return send(res, 404, 'application/json', JSON.stringify({ error: 'not_found' }));
    if (typeof body.status === 'string') call.status = body.status;
    if (typeof body.unit === 'string') call.unit = body.unit;
    if (typeof body.priority === 'string') call.priority = body.priority;
    if (typeof body.location === 'string') call.location = body.location;
    logEvent(`Updated call ${call.id}`);
    return send(res, 200, 'application/json', JSON.stringify({ ok: true, call }));
  }
  match = url.pathname.match(/^\/api\/units\/([^/]+)$/);
  if (match && req.method === 'PATCH') {
    const body = await readBody(req);
    const unit = state.units.find((item) => item.id === match[1]);
    if (!unit) return send(res, 404, 'application/json', JSON.stringify({ error: 'not_found' }));
    if (typeof body.status === 'string') unit.status = body.status;
    if (typeof body.location === 'string') unit.location = body.location;
    logEvent(`Updated unit ${unit.id}`);
    return send(res, 200, 'application/json', JSON.stringify({ ok: true, unit }));
  }
  match = url.pathname.match(/^\/api\/personnel\/([^/]+)$/);
  if (match && req.method === 'PATCH') {
    const body = await readBody(req);
    const person = state.personnel.find((item) => item.id === match[1]);
    if (!person) return send(res, 404, 'application/json', JSON.stringify({ error: 'not_found' }));
    if (typeof body.status === 'string') person.status = body.status;
    if (typeof body.station === 'string') person.station = body.station;
    logEvent(`Updated personnel ${person.id}`);
    return send(res, 200, 'application/json', JSON.stringify({ ok: true, person }));
  }
  return send(res, 200, 'text/html; charset=utf-8', render());
});

server.listen(port, '0.0.0.0', () => console.log(`Olympus CAD listening on ${port}`));
