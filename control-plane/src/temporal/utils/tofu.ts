import { exec } from 'child_process';
import { promisify } from 'util';
import { Context } from '@temporalio/activity';
import logger from './logger';

const execAsync = promisify(exec);

/**
 * Run an OpenTofu CLI command like `tofu plan` or `tofu apply`.
 * @param command One of 'plan' or 'apply'
 * @param workingDir Directory where terraform files exist
 * @returns stdout string or throws on error
 */
export async function runTofu(command: string, workingDir: string): Promise<string> {
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
    throw new Error(`${command} failed: ${errMsg}`);
  } finally {
    clearInterval(heartbeatInterval);
  }
}

/**
 *
 * @param workingDir
 *
 *
 * tofu init \
  -backend-config="bucket=my-terraform-state-bucket" \
  -backend-config="key=path/to/my/key.tfstate" \
  -backend-config="region=ap-southeast-1" \
  -backend-config="encrypt=true"
 */
// export async function tofuInit(workingDir: string, backendConfig: S3BackendConfig) {
//   console.log("backendConfig", backendConfig)
//   const cmd = `tofu init \
//   -backend-config="bucket=${backendConfig.bucket}" \
//   -backend-config="key=${backendConfig.key}/terraform.tfstate" \
//   -backend-config="region=${backendConfig.region}" \
//   -backend-config="encrypt=true" \
//   -reconfigure`

//   await runTofu(cmd, workingDir)
// }

// export async function tofuPlan(workingDir: string) {
//   await runTofu('tofu plan -no-color', workingDir)
// }
