import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const port = Number(process.env.PORT || 5050);
const orgName = process.env.OLYMPUS_CAD_DEFAULT_ORG || 'Olympus Command';
const dataDir = process.env.OLYMPUS_CAD_DATA_DIR || '/var/lib/dennco/olympus-cad';
const dataFile = path.join(dataDir, 'cad-state.json');
const callFolderRoot = path.join(dataDir, 'calls');

const defaults = {
  calls: [
    { id: 'CAD-1001', type: 'Service Request', priority: 'Normal', status: 'Open', unit: 'Unit-1', location: 'Operations Desk', x: 32, y: 44 },
    { id: 'CAD-1002', type: 'Road Event', priority: 'Review', status: 'Queued', unit: 'Unassigned', location: 'Pending geocode', x: 64, y: 58 },
  ],
  personnel: [
    { id: 'P-101', name: 'Dispatcher 1', role: 'Dispatcher', status: 'Available', station: 'Olympus Desk' },
    { id: 'P-102', name: 'Supervisor', role: 'Supervisor', status: 'Monitoring', station: 'Command' },
  ],
  units: [
    { id: 'Unit-1', type: 'Patrol', status: 'Available', location: 'Operations Desk', x: 42, y: 48 },
    { id: 'Unit-2', type: 'Response', status: 'Standby', location: 'Staging', x: 56, y: 35 },
  ],
  shifts: [{ id: 'S-1', name: 'Day Watch', time: '0700-1900', lead: 'Supervisor' }],
  logs: [{ id: 'L-1', time: new Date().toISOString(), event: 'CAD service online', actor: 'System' }],
  reports: [{ id: 'R-1', title: 'Daily Activity Summary', status: 'Draft', owner: 'Command' }],
  documents: [{ id: 'D-1', title: 'SOP - Dispatch Operations', type: 'Policy', status: 'Published' }],
  calendar: [{ id: 'C-1', title: 'Shift Briefing', when: 'Daily 0700', owner: 'Command' }],
  notes: [{ id: 'N-1', title: 'Watch Notes', body: 'Review open calls and unit status at shift change.' }],
  trainings: [{ id: 'T-1', title: 'CAD Orientation', status: 'Assigned', audience: 'All operators' }],
  inventory: [{ id: 'I-1', item: 'Radio Console', status: 'Operational', assigned: 'Dispatch' }],
};

const modules = ['Personnel', 'Calls', 'Units', 'Mapping', 'Shifts', 'Logs', 'Reports', 'Documents', 'Calendar', 'Notes', 'Trainings', 'Inventory'];
const fields = { shifts: ['name', 'time', 'lead'], reports: ['title', 'status', 'owner'], documents: ['title', 'type', 'status'], calendar: ['title', 'when', 'owner'], notes: ['title', 'body'], trainings: ['title', 'status', 'audience'], inventory: ['item', 'status', 'assigned'] };
const prefixes = { shifts: 'S', reports: 'R', documents: 'D', calendar: 'C', notes: 'N', trainings: 'T', inventory: 'I' };

function copy(v) { return JSON.parse(JSON.stringify(v)); }
function esc(v) { return String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]); }
function pct(v, f) { const n = Number(v); return Number.isFinite(n) ? Math.max(8, Math.min(92, n)) : f; }
function hash(v, seed = 1) { let h = seed; for (const c of String(v || 'cad')) h = (h * 31 + c.charCodeAt(0)) % 10000; return 12 + (h % 76); }
function folderName(v) { return String(v || 'call').replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 80); }

function load() {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
    const raw = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile, 'utf8')) : {};
    const state = { ...copy(defaults), ...raw };
    for (const key of Object.keys(defaults)) if (!Array.isArray(state[key])) state[key] = copy(defaults[key]);
    state.calls = state.calls.map((c, i) => ({ ...c, x: pct(c.x, hash(c.id || c.location, i + 2)), y: pct(c.y, hash(c.location || c.id, i + 8)) }));
    state.units = state.units.map((u, i) => ({ ...u, x: pct(u.x, hash(u.id || u.location, i + 11)), y: pct(u.y, hash(u.location || u.id, i + 17)) }));
    return state;
  } catch (err) {
    console.error('[Olympus CAD] load failed', err);
    return copy(defaults);
  }
}

let state = load();

function save() { fs.mkdirSync(dataDir, { recursive: true }); fs.writeFileSync(dataFile, JSON.stringify(state, null, 2)); }
function callFolder(call) { return path.join(callFolderRoot, folderName(call.id)); }
function writeCallFolder(call) { const dir = callFolder(call); fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, 'summary.json'), JSON.stringify(call, null, 2)); return dir; }
function log(event) { state.logs.unshift({ id: `L-${Date.now()}`, time: new Date().toISOString(), event, actor: 'Operator' }); state.logs = state.logs.slice(0, 200); save(); }
function send(res, status, type, body) { res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' }); res.end(body); }
function body(req) { return new Promise((resolve) => { let data = ''; req.on('data', c => { data += c; }); req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch { resolve({}); } }); }); }

for (const call of state.calls) writeCallFolder(call);
save();

function opts(list, current) { return list.map(v => `<option ${v === current ? 'selected' : ''}>${esc(v)}</option>`).join(''); }
function rows(items, keys) { return items.map(item => `<tr>${keys.map(k => `<td>${esc(item[k])}</td>`).join('')}</tr>`).join(''); }
function form(name) { return `<div class="form">${fields[name].map(f => `<input id="${name}-${f}" placeholder="${f}" />`).join('')}<button onclick='createRecord("${name}",${JSON.stringify(fields[name])})'>Add</button></div>`; }
function table(id, title, subtitle, heads, bodyRows, addForm = '') { return `<section id="${id}" class="panel"><div class="bar"><div><div class="k">${esc(subtitle)}</div><h2>${esc(title)}</h2></div></div>${addForm}<table><thead><tr>${heads.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${bodyRows}</tbody></table></section>`; }

function render() {
  const tiles = modules.map(m => `<button class="module" onclick="document.getElementById('${m.toLowerCase()}').scrollIntoView({behavior:'smooth'})">${m}</button>`).join('');
  const callRows = state.calls.map(c => `<tr data-call="${esc(c.id)}"><td>${esc(c.id)}</td><td>${esc(c.type)}</td><td>${esc(c.priority)}</td><td><select onchange='patchCall("${esc(c.id)}",{status:this.value})'>${opts(['Queued','Open','Dispatched','Closed'], c.status)}</select></td><td><input value="${esc(c.unit)}" onchange='patchCall("${esc(c.id)}",{unit:this.value})' /></td><td><input value="${esc(c.location)}" onchange='patchCall("${esc(c.id)}",{location:this.value})' /></td><td><code>${esc(callFolder(c))}</code></td><td><button onclick='patchCall("${esc(c.id)}",{status:"Closed"})'>Close</button></td></tr>`).join('');
  const unitRows = state.units.map(u => `<tr data-unit="${esc(u.id)}"><td>${esc(u.id)}</td><td>${esc(u.type)}</td><td><select onchange='patchUnit("${esc(u.id)}",{status:this.value})'>${opts(['Available','Standby','Assigned','En Route','On Scene','Out of Service'], u.status)}</select></td><td><input value="${esc(u.location)}" onchange='patchUnit("${esc(u.id)}",{location:this.value})' /></td><td><input value="${esc(u.x)}" onchange='patchUnit("${esc(u.id)}",{x:this.value})' /></td><td><input value="${esc(u.y)}" onchange='patchUnit("${esc(u.id)}",{y:this.value})' /></td></tr>`).join('');
  const personnelRows = state.personnel.map(p => `<tr><td>${esc(p.id)}</td><td>${esc(p.name)}</td><td>${esc(p.role)}</td><td><select onchange='patchPersonnel("${esc(p.id)}",{status:this.value})'>${opts(['Available','Monitoring','Busy','Off Duty'], p.status)}</select></td><td><input value="${esc(p.station)}" onchange='patchPersonnel("${esc(p.id)}",{station:this.value})' /></td></tr>`).join('');
  const markers = state.calls.filter(c => c.status !== 'Closed').map(c => `<button class="marker call" style="left:${c.x}%;top:${c.y}%" onclick='focusCall("${esc(c.id)}")' title="${esc(c.id)}">C</button>`).join('') + state.units.map(u => `<button class="marker unit" style="left:${u.x}%;top:${u.y}%" onclick='focusUnit("${esc(u.id)}")' title="${esc(u.id)}">U</button>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Olympus CAD</title><style>:root{color-scheme:dark}body{margin:0;background:#05070b;color:#dbeafe;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}main{padding:18px;display:grid;gap:16px}.panel{border:1px solid rgba(0,229,255,.25);background:rgba(15,23,42,.55)}.bar{display:flex;justify-content:space-between;gap:16px;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.08)}h1{margin:0;font-size:20px;letter-spacing:.16em;text-transform:uppercase;color:#e0f2fe}h2{margin:0;font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:#67e8f9}.k{color:#22d3ee;font-size:10px;letter-spacing:.22em;text-transform:uppercase}.modules{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;padding:14px}.module{text-align:left}button{border:1px solid rgba(0,229,255,.4);background:rgba(0,229,255,.08);color:#67e8f9;padding:7px 10px;text-transform:uppercase;letter-spacing:.12em;font-family:inherit;font-size:11px;cursor:pointer}table{width:100%;border-collapse:collapse;font-size:12px}th,td{text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.07)}th{color:rgba(255,255,255,.45);text-transform:uppercase;font-size:10px;letter-spacing:.16em}code{font-size:10px;color:#a7f3d0}input,select{background:#020617;border:1px solid rgba(255,255,255,.14);color:#dbeafe;padding:6px 8px;font-family:inherit;font-size:12px}.form{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;padding:14px}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px}.map{height:320px;margin:14px;border:1px solid rgba(255,255,255,.12);background:radial-gradient(circle at 35% 45%,rgba(0,229,255,.18),transparent 26%),#020617;position:relative;overflow:hidden}.map:before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px);background-size:32px 32px}.marker{position:absolute;z-index:2;width:24px;height:24px;border-radius:999px;padding:0;font-weight:900}.call{border-color:#f87171;background:#7f1d1d;color:#fecaca}.unit{border-color:#22d3ee;background:#083344;color:#cffafe}.legend{display:flex;gap:14px;padding:0 14px 14px;color:rgba(255,255,255,.55);font-size:11px}.note{padding:14px;color:rgba(255,255,255,.6);font-size:12px;line-height:1.65}.focus{outline:2px solid #fde047;background:rgba(253,224,71,.08)}@media(max-width:900px){.grid2{grid-template-columns:1fr}}</style></head><body><main><section class="panel"><div class="bar"><div><div class="k">${esc(orgName)}</div><h1>Olympus CAD Core</h1></div><div class="k">Persistent CAD</div></div><div class="modules">${tiles}</div></section>${table('calls','Calls','Dispatch queue and incident folders',['Item','Type','Priority','Status','Unit','Location','Folder','Action'],callRows)}<div class="grid2">${table('personnel','Personnel','Responders and operators',['ID','Name','Role','Status','Station'],personnelRows)}${table('units','Units','Unit status board',['ID','Type','Status','Location','Map X','Map Y'],unitRows)}</div><section id="mapping" class="panel"><div class="bar"><div><div class="k">Operational map</div><h2>Mapping</h2></div></div><div class="map">${markers}</div><div class="legend"><span>Red = active call</span><span>Cyan = unit</span><span>Closed calls hidden</span></div></section><div class="grid2">${table('shifts','Shifts','Schedules',['ID','Name','Time','Lead'],rows(state.shifts,['id','name','time','lead']),form('shifts'))}${table('logs','Logs','Audit trail',['ID','Time','Event','Actor'],rows(state.logs,['id','time','event','actor']))}${table('reports','Reports','Operational reporting',['ID','Title','Status','Owner'],rows(state.reports,['id','title','status','owner']),form('reports'))}${table('documents','Documents','Files and policies',['ID','Title','Type','Status'],rows(state.documents,['id','title','type','status']),form('documents'))}${table('calendar','Calendar','Events',['ID','Title','When','Owner'],rows(state.calendar,['id','title','when','owner']),form('calendar'))}${table('trainings','Trainings','Assignments',['ID','Title','Status','Audience'],rows(state.trainings,['id','title','status','audience']),form('trainings'))}${table('inventory','Inventory','Equipment',['ID','Item','Status','Assigned'],rows(state.inventory,['id','item','status','assigned']),form('inventory'))}<section id="notes" class="panel"><div class="bar"><div><div class="k">Operator notes</div><h2>Notes</h2></div></div>${form('notes')}<div class="note">${state.notes.map(n => `<strong>${esc(n.title)}</strong><br/>${esc(n.body)}`).join('<hr/>')}</div></section></div><section class="panel"><div class="bar"><h2>Integration</h2><span>${esc(dataDir)}</span></div><div class="note">Calls create local folders under ${esc(callFolderRoot)}. Each call folder contains summary.json and is updated when the call changes.</div></section></main><script>async function createCall(){await fetch('/api/calls',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:document.getElementById('type')?.value,priority:document.getElementById('priority')?.value,location:document.getElementById('location')?.value,unit:document.getElementById('unit')?.value})});location.reload()}async function patchCall(id,patch){await fetch('/api/calls/'+id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(patch)});location.reload()}async function patchUnit(id,patch){await fetch('/api/units/'+id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(patch)});location.reload()}async function patchPersonnel(id,patch){await fetch('/api/personnel/'+id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(patch)});location.reload()}async function createRecord(collection,fieldList){const body={};for(const f of fieldList){body[f]=document.getElementById(collection+'-'+f)?.value||''}await fetch('/api/'+collection,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});location.reload()}function focusCall(id){const r=document.querySelector('[data-call="'+id+'"]');if(r){r.scrollIntoView({behavior:'smooth',block:'center'});r.classList.add('focus');setTimeout(()=>r.classList.remove('focus'),2200)}}function focusUnit(id){const r=document.querySelector('[data-unit="'+id+'"]');if(r){r.scrollIntoView({behavior:'smooth',block:'center'});r.classList.add('focus');setTimeout(()=>r.classList.remove('focus'),2200)}}</script></body></html>`;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/health') return send(res, 200, 'application/json', JSON.stringify({ ok: true, persistent: true, dataFile, callFolderRoot }));
  if (url.pathname === '/api/modules' && req.method === 'GET') return send(res, 200, 'application/json', JSON.stringify({ modules }));
  if (url.pathname === '/api/calls' && req.method === 'GET') return send(res, 200, 'application/json', JSON.stringify({ calls: state.calls }));
  if (url.pathname === '/api/personnel' && req.method === 'GET') return send(res, 200, 'application/json', JSON.stringify({ personnel: state.personnel }));
  if (url.pathname === '/api/units' && req.method === 'GET') return send(res, 200, 'application/json', JSON.stringify({ units: state.units }));
  if (url.pathname === '/api/calls' && req.method === 'POST') { const b = await body(req); const next = { id: `CAD-${Math.floor(1000 + Math.random() * 9000)}`, type: b.type || 'Service Request', priority: b.priority || 'Normal', status: 'Queued', unit: b.unit || 'Unassigned', location: b.location || 'Pending geocode', x: hash(b.location || b.type, 3), y: hash(b.unit || b.priority, 9) }; state.calls.unshift(next); writeCallFolder(next); log(`Created call ${next.id}`); return send(res, 200, 'application/json', JSON.stringify({ ok: true, call: next, folder: callFolder(next) })); }
  let m = url.pathname.match(/^\/api\/calls\/([^/]+)\/folder$/); if (m && req.method === 'GET') { const call = state.calls.find(i => i.id === m[1]); if (!call) return send(res, 404, 'application/json', JSON.stringify({ error: 'not_found' })); return send(res, 200, 'application/json', JSON.stringify({ ok: true, folder: writeCallFolder(call) })); }
  m = url.pathname.match(/^\/api\/calls\/([^/]+)$/); if (m && req.method === 'PATCH') { const b = await body(req); const call = state.calls.find(i => i.id === m[1]); if (!call) return send(res, 404, 'application/json', JSON.stringify({ error: 'not_found' })); if (typeof b.status === 'string') call.status = b.status; if (typeof b.unit === 'string') call.unit = b.unit; if (typeof b.priority === 'string') call.priority = b.priority; if (typeof b.location === 'string') call.location = b.location; if (b.x !== undefined) call.x = pct(b.x, call.x); if (b.y !== undefined) call.y = pct(b.y, call.y); writeCallFolder(call); log(`Updated call ${call.id}`); return send(res, 200, 'application/json', JSON.stringify({ ok: true, call, folder: callFolder(call) })); }
  m = url.pathname.match(/^\/api\/units\/([^/]+)$/); if (m && req.method === 'PATCH') { const b = await body(req); const unit = state.units.find(i => i.id === m[1]); if (!unit) return send(res, 404, 'application/json', JSON.stringify({ error: 'not_found' })); if (typeof b.status === 'string') unit.status = b.status; if (typeof b.location === 'string') unit.location = b.location; if (b.x !== undefined) unit.x = pct(b.x, unit.x); if (b.y !== undefined) unit.y = pct(b.y, unit.y); log(`Updated unit ${unit.id}`); return send(res, 200, 'application/json', JSON.stringify({ ok: true, unit })); }
  m = url.pathname.match(/^\/api\/personnel\/([^/]+)$/); if (m && req.method === 'PATCH') { const b = await body(req); const p = state.personnel.find(i => i.id === m[1]); if (!p) return send(res, 404, 'application/json', JSON.stringify({ error: 'not_found' })); if (typeof b.status === 'string') p.status = b.status; if (typeof b.station === 'string') p.station = b.station; log(`Updated personnel ${p.id}`); return send(res, 200, 'application/json', JSON.stringify({ ok: true, personnel: p })); }
  m = url.pathname.match(/^\/api\/([^/]+)$/); if (m && req.method === 'POST' && fields[m[1]]) { const collection = m[1]; const b = await body(req); const item = { id: `${prefixes[collection]}-${Date.now()}` }; for (const f of fields[collection]) item[f] = b[f] || ''; state[collection].unshift(item); log(`Created ${collection} item ${item.id}`); return send(res, 200, 'application/json', JSON.stringify({ ok: true, item })); }
  return send(res, 200, 'text/html; charset=utf-8', render());
});

server.listen(port, '0.0.0.0', () => console.log(`Olympus CAD listening on ${port}`));
