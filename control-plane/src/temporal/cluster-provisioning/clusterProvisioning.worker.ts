import { NativeConnection, Worker } from '@temporalio/worker';
import * as activities from './clusterProvisioning.activities';
import dotenv from 'dotenv';

const env = dotenv.config();

async function run() {
  const connection = await NativeConnection.connect({ address: env.parsed?.TEMPORAL_ADDRESS || 'localhost:7233' });

  const worker = await Worker.create({
    workflowsPath: require.resolve('./clusterProvisioning.workflow'),
    activities,
    taskQueue: 'clusterProvisioning',
    connection,
  });
  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
