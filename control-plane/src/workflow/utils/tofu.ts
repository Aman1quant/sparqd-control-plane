import { Context } from '@temporalio/activity';
import { spawn } from 'child_process';
import * as fs from 'fs';

import { WriteTfVarsJsonFileInput } from '../types';
import logger from './logger';

/**
 * Executes an OpenTofu CLI command using child_process.spawn,
 * with real-time logging and Temporal heartbeat support.
 *
 * Streams stdout and stderr to the logger, and returns the combined stdout
 * on success. Rejects with detailed error on failure.
 *
 * @param {string} command - The full tofu CLI command to run (e.g. "tofu plan -var-file=...").
 * @param {string} workingDir - The directory in which to run the command.
 * @returns {Promise<string>} - Resolves with stdout output if the command succeeds.
 * @throws {Error} - Throws with stderr or exit code if the command fails.
 */
export async function runTofu(command: string, workingDir: string): Promise<string> {
  logger.info({ command, cwd: workingDir }, 'Running OpenTofu command');

  const ctx = Context.current();

  // Periodic Temporal heartbeat to indicate the worker is still alive
  const heartbeatInterval = setInterval(() => {
    ctx.heartbeat(`Running ${command}`);
  }, 10000); // heartbeat every 10 seconds

  return new Promise((resolve, reject) => {
    // Split the command into binary and arguments for spawn
    const [cmd, ...args] = command.split(' ');

    const child = spawn(cmd, args, {
      cwd: workingDir,
      env: process.env,
      shell: true, // Allow shell features like quotes and pipes
      stdio: ['inherit', 'pipe', 'pipe'], // Inherit stdin; pipe stdout and stderr
    });

    let stdout = '';
    let stderr = '';

    // Capture and log stdout in real-time
    child.stdout.on('data', (data) => {
      const text = data.toString();
      stdout += text;
      logger.info({ command }, `stdout: ${text.trim()}`);
    });

    // Capture and log stderr in real-time
    child.stderr.on('data', (data) => {
      const text = data.toString();
      stderr += text;
      logger.warn({ command }, `stderr: ${text.trim()}`);
    });

    // Handle errors that prevent the process from starting
    child.on('error', (err) => {
      clearInterval(heartbeatInterval);
      logger.error({ err, command }, 'OpenTofu spawn error');
      reject(err);
    });

    // Handle process completion
    child.on('close', (code) => {
      clearInterval(heartbeatInterval);
      if (code === 0) {
        logger.info({ command }, 'OpenTofu finished successfully');
        resolve(stdout.trim());
      } else {
        logger.error({ code, command, stderr: stderr.trim() }, 'OpenTofu failed');
        reject(new Error(`${command} failed with exit code ${code}: ${stderr.trim()}`));
      }
    });
  });
}

export async function writeTfVarsJsonFile(data: WriteTfVarsJsonFileInput) {
  fs.writeFileSync(data.outputPath, JSON.stringify(data.tfVarsJsonData, null, 2));
  return data.outputPath;
}
