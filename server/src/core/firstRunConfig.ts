import fs from 'fs';
import path from 'path';

export interface FirstRunConfig {
  adminUser: string;
  accessCode: string;
  productName: string;
  shortName: string;
  footerText: string;
  createdAt: string;
}

const configDir = process.env.OLYMPUS_CONFIG_DIR || '/etc/dennco/olympus-command';
const configPath = path.join(configDir, 'first-run.json');

export function readFirstRunConfig(): FirstRunConfig | null {
  if (!fs.existsSync(configPath)) return null;
  return JSON.parse(fs.readFileSync(configPath, 'utf8')) as FirstRunConfig;
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.OLYMPUS_ADMIN_ACCESS_CODE || readFirstRunConfig()?.accessCode);
}

export function getAdminUser(): string {
  return process.env.OLYMPUS_ADMIN_USER || readFirstRunConfig()?.adminUser || 'admin';
}

export function getAccessCode(): string {
  return process.env.OLYMPUS_ADMIN_ACCESS_CODE || readFirstRunConfig()?.accessCode || '';
}

export function verifyAdminLogin(username: string, accessCode: string): boolean {
  return username === getAdminUser() && accessCode === getAccessCode() && Boolean(getAccessCode());
}

export function createFirstRunConfig(input: Partial<FirstRunConfig>): FirstRunConfig {
  if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });

  const adminUser = (input.adminUser || 'admin').trim();
  const accessCode = (input.accessCode || '').trim();

  if (!adminUser) throw new Error('Admin user is required.');
  if (accessCode.length < 12) throw new Error('Access code must be at least 12 characters.');

  const config: FirstRunConfig = {
    adminUser,
    accessCode,
    productName: (input.productName || 'Dennco Olympus Command').trim(),
    shortName: (input.shortName || 'OLYMPUS').trim(),
    footerText: (input.footerText || 'Dennco Olympus Command').trim(),
    createdAt: new Date().toISOString(),
  };

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), { mode: 0o600 });
  return config;
}

export function getRuntimeBranding() {
  const firstRun = readFirstRunConfig();
  return {
    productName: process.env.OLYMPUS_PRODUCT_NAME || firstRun?.productName || 'Dennco Olympus Command',
    shortName: process.env.OLYMPUS_SHORT_NAME || firstRun?.shortName || 'OLYMPUS',
    footerText: process.env.OLYMPUS_FOOTER_TEXT || firstRun?.footerText || 'Dennco Olympus Command',
  };
}
