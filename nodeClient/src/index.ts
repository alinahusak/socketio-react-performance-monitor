// The node program that captures local performance data
// and sends it via socket to the server
// Req:
// - socket.io-client

import { io, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '../../shared/types';
import { getMachineId, performanceLoadData } from './perfData';

const SERVER_URL = process.env.SERVER_URL ?? 'http://127.0.0.1:3000'; // where our server is listening

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SERVER_URL, {
  auth: {
    token: process.env.NODE_CLIENT_TOKEN ?? '239rfaiskdfvq243EGa4q3wefsdad',
  },
});

socket.on('connect', () => {
  console.log(`Connected to ${SERVER_URL}`);
  const macA = getMachineId();

  const perfDataInterval = setInterval(async () => {
    // every second, get the performance data and emit it
    const machinePerf = await performanceLoadData();
    socket.emit('perfData', { ...machinePerf, macA });
  }, 1000);

  socket.on('disconnect', () => {
    clearInterval(perfDataInterval); // if we disconnect for any reason (this includes reconnects), stop ticking
  });
});

socket.on('connect_error', (err) => {
  console.log(`Could not connect to ${SERVER_URL}: ${err.message}`);
});
