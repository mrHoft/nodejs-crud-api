import cluster from 'cluster';
import os from 'os';

jest.mock('cluster');
jest.mock('os');

declare global {
  namespace NodeJS {
    interface Process {
      __terminate?: () => Promise<void>;
    }
  }
}

describe('Multiple instances', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (os.cpus as jest.Mock).mockReturnValue([{}, {}, {}]);
    (cluster.isPrimary as boolean) = true;
    process.env.PORT = '4000';
  });

  it('should create the correct number of workers', () => {
    require('./worker');

    expect(cluster.fork).toHaveBeenCalledTimes(2);
    expect(cluster.fork).toHaveBeenCalledWith({ WORKER_PORT: '4001' });
    expect(cluster.fork).toHaveBeenCalledWith({ WORKER_PORT: '4002' });
  });

  afterAll(async () => {
    Object.values(cluster.workers as any).forEach((worker: any) => {
      worker.kill();
    });
    if (process.__terminate) {
      await process.__terminate();
    }
  });
});
