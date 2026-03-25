import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

async function hashLocaleFiles() {
  try {
    const localesDir = path.join(process.cwd(), 'locales');
    const entries = await fs.readdir(localesDir);
    const jsonFiles = entries.filter(name => name.endsWith('.json')).sort();

    const hash = crypto.createHash('sha256');
    for (const filename of jsonFiles) {
      const content = await fs.readFile(path.join(localesDir, filename));
      hash.update(filename);
      hash.update('\0');
      hash.update(content);
      hash.update('\0');
    }

    return hash.digest('hex').slice(0, 12);
  } catch {
    return null;
  }
}

function coerceShortBuildId(value) {
  if (!value) return null;
  return String(value).trim().slice(0, 12) || null;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const envBuildId =
    coerceShortBuildId(process.env.VERCEL_GIT_COMMIT_SHA) ||
    coerceShortBuildId(process.env.VERCEL_GITHUB_COMMIT_SHA) ||
    coerceShortBuildId(process.env.GITHUB_SHA) ||
    coerceShortBuildId(process.env.COMMIT_SHA) ||
    coerceShortBuildId(process.env.RENDER_GIT_COMMIT);

  const localeHash = await hashLocaleFiles();
  const buildId =
    envBuildId ||
    localeHash ||
    coerceShortBuildId(process.env.npm_package_version) ||
    'dev';

  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ buildId });
}

