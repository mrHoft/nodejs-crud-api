import cluster from 'cluster';
import os from 'os';
import { request } from 'http';
import { createAppServer } from './server';

const BASE_PORT = parseInt(process.env.WORKER_PORT || '4000', 10);
const numCPUs = os.cpus().length;
const workerCount = Math.max(1, numCPUs - 1);

if (cluster.isPrimary) {
  for (let i = 0; i < workerCount; i++) {
    const workerPort = BASE_PORT + 1 + i;
    cluster.fork({ WORKER_PORT: workerPort.toString() });
  }

  const balancer = createAppServer(BASE_PORT);
  let currentWorker = 1;

  balancer.on('request', (req, res) => {
    const workerPort = BASE_PORT + currentWorker;
    const proxy = request(
      {
        hostname: 'localhost',
        port: workerPort,
        path: req.url,
        method: req.method,
        headers: req.headers,
      },
      proxyRes => {
        res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      }
    );

    req.pipe(proxy, { end: true });

    currentWorker = (currentWorker % workerCount) + 1;
  });

  cluster.on('exit', worker => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });

  const terminate = async () => {
    await new Promise<void>(resolve => balancer.close(() => resolve()));

    const workersDisconnect = Object.values(cluster.workers || {}).map(worker => {
      return new Promise<void>(resolve => {
        if (!worker) return resolve();
        worker.on('disconnect', resolve);
        worker.kill();
      });
    });

    await Promise.all(workersDisconnect);
  };

  // Expose terminate for tests
  if (process.env.NODE_ENV === 'test') {
    (process as NodeJS.Process & { __terminate?: typeof terminate }).__terminate = terminate;
  }
} else {
  const workerPort = parseInt(process.env.WORKER_PORT || '4001', 10);
  createAppServer(workerPort);
}
