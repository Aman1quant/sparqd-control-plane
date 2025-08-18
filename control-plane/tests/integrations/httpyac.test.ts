import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// const COMPOSE_FILE = 'docker-compose.integration.yml';

// function runCompose(command: string) {
//   console.log(`Running: docker-compose -f ${COMPOSE_FILE} ${command}`);
//   execSync(`docker-compose -f ${COMPOSE_FILE} ${command}`, { stdio: 'inherit' });
// }

describe('Integration API Tests (httpyac)', () => {
  // beforeAll(() => {
  //   // Start Docker Compose in detached mode
  //   runCompose('up -d --build');

  //   // Optional: wait for the app to be ready
  //   console.log('Waiting for app to be ready...');
  //   let ready = false;
  //   const maxRetries = 20;
  //   const delay = 2000; // 2 seconds
  //   for (let i = 0; i < maxRetries; i++) {
  //     try {
  //       execSync(`curl -f ${APP_URL}/health-check`);
  //       ready = true;
  //       break;
  //     } catch (err) {
  //       console.log('Waiting...');
  //       execSync(`sleep ${delay / 1000}`);
  //     }
  //   }
  //   if (!ready) throw new Error('App did not become ready in time');
  // }, 120_000); // 2 minutes timeout

  // afterAll(() => {
  //   // Tear down Docker Compose
  //   runCompose('down -v');
  // });

  const HTTP_DIR = path.join(__dirname, 'http');

  const env = {
    ...process.env,              // inherit existing env
    BASE_URL: 'http://localhost:3000',
    ACCESS_TOKEN: 'your_test_token_here',
  };


  const files = fs
    .readdirSync(HTTP_DIR)
    .filter(f => f.endsWith('.http') || f.endsWith('.yaml'))
    .map(f => path.join(HTTP_DIR, f));

  it('runs all httpyac files sequentially', () => {
    const results: { file: string; success: boolean }[] = [];

    for (const file of files) {
      let exitCode = 0;
      console.log(`\n=== Running httpyac for: ${file} ===`);
      try {
        execSync(`npx httpyac ${file} --all --quiet`, {
          stdio: 'pipe',  // print CLI output to console
          env,               // pass env dictionary
        });
      } catch (err: any) {
        exitCode = err.status ?? 1;
      }

      results.push({ file, success: exitCode === 0 });
    }


    const failed = results.filter(r => !r.success);
    // Summary
    console.log('\n=== httpyac test summary ===');
    results.forEach(r => console.log(`${r.success ? '✅' : '❌'} ${r.file}`));

    // if (failed.length > 0) {
    //   console.warn(`\n${failed.length} httpyac file(s) failed`);
    // }
    expect(failed.length).toBe(0);
  });
});