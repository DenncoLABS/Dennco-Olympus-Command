import express from 'express';
import { execFile } from 'child_process';
import { promisify } from 'util';

const router = express.Router();
const execFileAsync = promisify(execFile);

async function serviceState(name: string) {
  try {
    const { stdout } = await execFileAsync('systemctl', ['is-active', name], { timeout: 3000 });
    return stdout.trim() || 'unknown';
  } catch {
    return 'inactive';
  }
}

async function serviceEnabled(name: string) {
  try {
    const { stdout } = await execFileAsync('systemctl', ['is-enabled', name], { timeout: 3000 });
    return stdout.trim() || 'unknown';
  } catch {
    return 'disabled';
  }
}

router.get('/status', async (_req, res) => {
  const agent = await serviceState('zabbix-agent');
  const enabled = await serviceEnabled('zabbix-agent');
  res.json({
    app: 'Zabbix',
    agentService: 'zabbix-agent',
    agentState: agent,
    enabled,
    defaultAgentPort: 10050,
    defaultServerPort: 10051,
    installHelper: '/opt/dennco/olympus-command/scripts/install-infrastructure-apps.sh zabbix',
  });
});

export default router;
