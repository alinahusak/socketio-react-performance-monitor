// A minimal example of Node's cluster module. It is not part of the app.
import cluster from 'cluster'; // native to node
import http from 'http';
import { availableParallelism } from 'os';

const numCPUs = availableParallelism();

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  // Workers can share any TCP connection. In this case it is an HTTP server
  http
    .createServer((_req, res) => {
      res.writeHead(200);
      res.end('hello world\n');
      console.log(`The worker on ${process.pid} has been used!!!!`);
    })
    .listen(8000);

  console.log(`Worker ${process.pid} started`);
}
