// Socket.IO server that serves both the node and the react clients
// Req:
// - socket.io
// - @socket.io/cluster-adapter
// - @socket.io/sticky

// This is the entrypoint of our cluster: the primary process makes workers,
// and the workers do the Socket.IO handling.
// See https://github.com/elad/node-cluster-socket.io

import cluster from 'cluster'; // makes it so we can use multiple processes
import http from 'http';
import { cpus } from 'os';
import { Server } from 'socket.io';
import { setupMaster, setupWorker } from '@socket.io/sticky'; // makes it so a client finds its way back to the same worker
import { createAdapter, setupPrimary } from '@socket.io/cluster-adapter'; // makes it so every worker can emit to everyone
import type { ClientToServerEvents, ServerToClientEvents } from '../../shared/types';
import { socketMain } from './socketMain';

const PORT = Number(process.env.PORT) || 3000;
// one worker per core by default; set WORKERS to use fewer (e.g. on a small hosting plan)
const numCPUs = Number(process.env.WORKERS) || cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  const httpServer = http.createServer();

  // setup sticky sessions
  setupMaster(httpServer, {
    loadBalancingMethod: 'least-connection',
  });

  // setup connections between the workers
  setupPrimary();

  // needed for packets containing buffers (you can ignore it if you only send plaintext objects)
  cluster.setupPrimary({
    serialization: 'advanced',
  });

  httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`); // internet facing!
  });

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  console.log(`Worker ${process.pid} started`);

  const httpServer = http.createServer();
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL ?? 'http://localhost:3001',
      credentials: true,
    },
  });

  // use the cluster adapter (change from the default adapter)
  io.adapter(createAdapter());

  // setup the connection with the primary process
  setupWorker(io);

  // socketMain is OUR file where our emits and listens happen. It needs the io object
  socketMain(io, process.pid);
}
