import { mkdtemp, rm } from 'fs/promises';
import * as fs from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomBytes } from 'crypto';
import logger from './logger';

export async function createEphemeralDir(prefix = 'ephemeral-'): Promise<string> {
  const randomId = randomBytes(6).toString('hex');
  const dir = await mkdtemp(join(tmpdir(), `${prefix}${randomId}-`));
  logger.info(`[createEphemeralDir] Created: ${dir}`);
  return dir;
}

export async function deleteEphemeralDir(dir: string): Promise<void> {
  try {
    await rm(dir, { recursive: true, force: true });
    logger.info(`[deleteEphemeralDir] Deleted: ${dir}`);
  } catch (err) {
    logger.warn(`[deleteEphemeralDir] Failed to delete ${dir}:`, err);
    throw err; // Optional: rethrow if you want to fail the activity
  }
}

export async function copyTemplateToDir(srcDir: string, destDir: string): Promise<string> {
  await fs.promises.cp(srcDir, destDir, { recursive: true });
  return destDir;
}
