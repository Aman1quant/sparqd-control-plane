import { exec } from 'child_process';
import pino from 'pino';
import { promisify } from 'util';
import { Context } from '@temporalio/activity';


const execAsync = promisify(exec);
const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      singleLine: false,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

/**
 * Run an OpenTofu CLI command like `tofu plan` or `tofu apply`.
 * @param command One of 'plan' or 'apply'
 * @param workingDir Directory where terraform files exist
 * @returns stdout string or throws on error
 */
async function runTofu(
  command: string,
  workingDir: string
): Promise<string> {

  logger.info({ command: command, cwd: workingDir }, `Running OpenTofu command`);

  const ctx = Context.current();
  const heartbeatInterval = setInterval(() => {
    ctx.heartbeat(`Running ${command}`);
  }, 10000); // heartbeat every 10s


  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: workingDir,
      env: process.env,
    });

    if (stderr?.trim()) {
      logger.warn({ stderr: stderr.trim(), command }, 'OpenTofu stderr');
    }

    if (stdout?.trim()) {
      logger.info({ stdout: stdout.trim(), command }, 'OpenTofu stdout');
    }

    return stdout;
  } catch (error: any) {
    const errMsg = error.stderr || error.message;
    logger.error({ error: errMsg, command }, 'OpenTofu command failed');
    throw new Error(`tofu ${command} failed: ${errMsg}`);
  } finally {
    clearInterval(heartbeatInterval);
  }
}

export async function tofuInit(workingDir: string) {
  await runTofu('tofu init ', workingDir)
}

export async function tofuPlan(workingDir: string) {
  await runTofu('tofu plan -no-color', workingDir)
}
