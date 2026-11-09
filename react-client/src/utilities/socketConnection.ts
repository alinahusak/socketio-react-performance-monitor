import { io, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '../../../shared/types';

const SERVER_URL = process.env.REACT_APP_SERVER_URL ?? 'http://localhost:3000'; // our server is at :3000

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SERVER_URL, {
  auth: { token: process.env.REACT_APP_CLIENT_TOKEN ?? '23jrtiheriufyqwidsf' },
});

export default socket;
