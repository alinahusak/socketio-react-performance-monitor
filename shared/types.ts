// Types shared by the node client, the server and the React client:
// the shape of the data and of the Socket.IO events that go over the wire.

/** Everything a node client measures about its machine. */
export interface MachinePerf {
  freeMem: number; // bytes
  totalMem: number; // bytes
  usedMem: number; // bytes
  memUseage: number; // 0 to 1, two decimals
  osType: string;
  upTime: number; // seconds
  cpuType: string;
  numCores: number;
  cpuSpeed: number; // MHz
  cpuLoad: number; // %
}

/** One tick of data from one machine. macA identifies the machine. */
export interface PerfData extends MachinePerf {
  macA: string;
}

/** Tells the dashboard that a machine started or stopped reporting. */
export interface ConnectedOrNot {
  machineMacA: string;
  isAlive: boolean;
}

export interface ServerToClientEvents {
  welcome: (message: string) => void;
  perfData: (data: PerfData) => void;
  connectedOrNot: (data: ConnectedOrNot) => void;
}

export interface ClientToServerEvents {
  perfData: (data: PerfData) => void;
}
