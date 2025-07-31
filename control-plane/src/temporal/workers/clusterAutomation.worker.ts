import { NativeConnection, Worker } from '@temporalio/worker';
import * as activities from '../activities/clusterAutomation.activity';

async function run() {
  const connection = await NativeConnection.connect({ address: process.env.TEMPORAL_ADDRESS || 'localhost:7233' });

  const worker = await Worker.create({
    workflowsPath: require.resolve('../workflows/clusterAutomation.workflow'),
    activities,
    taskQueue: 'clusterAutomation',
    connection,
  });
  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
