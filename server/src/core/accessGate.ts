import type { Request, Response, NextFunction } from 'express';

const COOKIE_NAME = 'olympus_access';
const COOKIE_VALUE = 'granted';

function hasAccessCookie(req: Request): boolean {
  const cookieHeader = req.headers.cookie || '';
  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .some((part) => part === `${COOKIE_NAME}=${COOKIE_VALUE}`);
}

function loginPage(message = ''): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Dennco Olympus Command Login</title>
  <style>
    :root { color-scheme: dark; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: radial-gradient(circle at top, #082f49, #020617 48%, #000); color: #e0f2fe; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    form { width: min(430px, calc(100vw - 40px)); border: 1px solid rgba(34, 211, 238, .35); background: rgba(2, 6, 23, .92); padding: 32px; box-shadow: 0 0 50px rgba(34, 211, 238, .14); }
    .eyebrow { font-size: 11px; letter-spacing: .35em; color: rgba(103, 232, 249, .75); text-transform: uppercase; margin-bottom: 10px; }
    h1 { margin: 0 0 12px; font-size: 30px; letter-spacing: .18em; text-transform: uppercase; }
    p { color: rgba(255,255,255,.55); font-size: 13px; line-height: 1.55; margin: 0 0 24px; }
    label { display: block; color: rgba(255,255,255,.55); font-size: 11px; letter-spacing: .2em; text-transform: uppercase; margin: 18px 0 8px; }
    input { box-sizing: border-box; width: 100%; background: #000; color: #fff; border: 1px solid rgba(255,255,255,.22); padding: 13px 14px; font: inherit; outline: none; }
    input:focus { border-color: rgba(103, 232, 249, .9); }
    button { width: 100%; margin-top: 22px; padding: 13px 14px; border: 1px solid rgba(103, 232, 249, .9); background: rgba(34, 211, 238, .12); color: #bae6fd; font: inherit; letter-spacing: .22em; text-transform: uppercase; cursor: pointer; }
    button:hover { background: rgba(34, 211, 238, .2); }
    .msg { border: 1px solid rgba(248, 113, 113, .35); background: rgba(127, 29, 29, .25); color: #fecaca; padding: 12px; margin-bottom: 18px; font-size: 13px; }
  </style>
</head>
<body>
  <form method="post" action="/api/admin/login">
    <div class="eyebrow">Secure Console</div>
    <h1>OLYMPUS</h1>
    <p>Dennco Olympus Command requires administrator access before the command interface is loaded.</p>
    ${message ? `<div class="msg">${message}</div>` : ''}
    <label for="username">Admin user</label>
    <input id="username" name="username" value="admin" autocomplete="username" />
    <label for="accessCode">Access code</label>
    <input id="accessCode" name="accessCode" type="password" autocomplete="current-password" autofocus />
    <button type="submit">Enter Command</button>
  </form>
</body>
</html>`;
}

export function grantAccess(res: Response): void {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${COOKIE_VALUE}; HttpOnly; SameSite=Lax; Path=/; Max-Age=43200`);
}

export function clearAccess(res: Response): void {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
}

export function renderLogin(res: Response, message?: string): void {
  res.status(200).type('html').send(loginPage(message));
}

export function requireAdminAccess(req: Request, res: Response, next: NextFunction): void {
  if (req.path === '/health' || req.path === '/api/admin/runtime-settings' || req.path === '/api/admin/login' || req.path === '/api/admin/logout') {
    return next();
  }

  if (hasAccessCookie(req)) {
    return next();
  }

  if (req.path.startsWith('/api/')) {
    res.status(401).json({ error: 'Admin login required.' });
    return;
  }

  renderLogin(res);
}
