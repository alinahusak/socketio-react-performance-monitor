# Socket.IO + React Performance Monitor

A real-time dashboard that shows the CPU load, memory usage and system information of any number of machines. Each machine runs a small Node.js agent that measures its own performance every second. The agent streams the data over Socket.IO to a clustered server, and the server forwards it live to a React dashboard.

## How it works

```
┌──────────────┐  perfData (1/s)  ┌──────────────────────┐  perfData          ┌──────────────┐
│  nodeClient  │ ───────────────▶ │        server        │ ─────────────────▶ │ react-client │
│ (machine A)  │                  │  Node cluster:       │  connectedOrNot    │  dashboard   │
├──────────────┤                  │  primary + N workers │ ─────────────────▶ │              │
│  nodeClient  │ ───────────────▶ │  sticky sessions,    │                    │ one widget   │
│ (machine B)  │                  │  cluster adapter     │                    │ per machine  │
└──────────────┘                  └──────────────────────┘                    └──────────────┘
```

1. **nodeClient** runs on every machine you want to watch. Once a second it reads data from Node's `os` module and emits a `perfData` event. It identifies its machine by an ID (`macA`) built from the MAC address of the first external network interface.
2. **server** checks every connection's token and puts it in one of two rooms: `nodeClient` or `reactClient`. It forwards each `perfData` tick to the dashboards. When a machine sends its first tick or disconnects, it also emits a `connectedOrNot` event.
3. **react-client** keeps the latest tick of every machine and re-renders once per second. It shows one widget per machine, and marks a widget **Offline** when its agent disconnects.

## What is measured

| Metric | Source |
|---|---|
| CPU load, % | difference between two `os.cpus()` samples taken 100 ms apart, averaged over all cores |
| Memory: total, free, used, % used | `os.totalmem()`, `os.freemem()` |
| Operating system | `os.type()` (`Darwin` is shown as `Mac`) |
| Uptime | `os.uptime()` |
| CPU model, number of cores, clock speed | `os.cpus()` |

## Project structure

```
├── shared/          TypeScript types for the data and the Socket.IO events, used by all three parts
├── server/          Socket.IO server
│   └── src/
│       ├── servers.ts      entry point: cluster primary, workers, sticky sessions, CORS
│       ├── socketMain.ts   authentication, rooms, forwarding of events
│       └── clusterTest.ts  minimal standalone example of Node's cluster module (not part of the app)
├── nodeClient/      performance-collecting agent
│   └── src/
│       ├── index.ts        connection to the server, 1-second emit loop
│       └── perfData.ts     metric collection and machine ID
└── react-client/    dashboard (Create React App + TypeScript)
    └── src/
        ├── App.tsx                 subscribes to perfData, renders the widgets
        ├── perfDataComponents/     Widget, Cpu, Mem, Info
        └── utilities/              socket connection, canvas gauge animation
```

## Server architecture

The server uses Node's `cluster` module to use every CPU core:

- **The primary process** owns the public HTTP port and forks the workers. If a worker dies, the primary forks a new one.
- **`@socket.io/sticky`** sends each client back to the same worker on every request. Socket.IO's HTTP long-polling transport needs this.
- **`@socket.io/cluster-adapter`** passes events between workers. A dashboard connected to worker 1 still receives data from an agent connected to worker 5.

## Socket.IO events

All event types are defined in `shared/types.ts`.

| Event | Direction | Payload |
|---|---|---|
| `perfData` | nodeClient → server → react-client | `PerfData`: all metrics plus the machine ID `macA` |
| `connectedOrNot` | server → react-client | `{ machineMacA, isAlive }` |
| `welcome` | server → any client | greeting string |

## Configuration

Every part reads its settings from environment variables. The defaults work for running everything locally.

| Part | Variable | Default | Purpose |
|---|---|---|---|
| server | `PORT` | `3000` | port the server listens on |
| server | `CLIENT_URL` | `http://localhost:3001` | dashboard origin allowed by CORS |
| server | `WORKERS` | number of CPU cores | number of worker processes |
| server | `NODE_CLIENT_TOKEN` | built-in value | token expected from agents |
| server | `REACT_CLIENT_TOKEN` | built-in value | token expected from dashboards |
| nodeClient | `SERVER_URL` | `http://127.0.0.1:3000` | server address |
| nodeClient | `NODE_CLIENT_TOKEN` | built-in value | must match the server |
| react-client | `REACT_APP_SERVER_URL` | `http://localhost:3000` | server address (set at build time) |
| react-client | `REACT_APP_CLIENT_TOKEN` | built-in value | must match the server |

## Running locally

Node.js 18 or newer. Use a separate terminal for each part:

```bash
cd server && npm install && npm run dev
```

```bash
cd nodeClient && npm install && npm run dev
```

```bash
cd react-client && npm install && PORT=3001 npm start
```

Open http://localhost:3001. To see several machines, start `nodeClient` on other computers with `SERVER_URL` pointing at the server. You can also start it several times on one computer: each run gets its own random machine ID.

## Tech stack

- **Server:** Node.js, TypeScript, Socket.IO 4, `cluster`, `@socket.io/sticky`, `@socket.io/cluster-adapter`
- **Agent:** Node.js, TypeScript, `socket.io-client`, `os`
- **Dashboard:** React 18, TypeScript, Create React App, `socket.io-client`, canvas gauges, Moment.js
