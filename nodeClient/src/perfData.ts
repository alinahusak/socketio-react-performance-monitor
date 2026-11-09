import os from 'os'; // native to node!
import type { MachinePerf } from '../../shared/types';

interface CpuAverage {
  idle: number;
  total: number;
}

const cpuAverage = (): CpuAverage => {
  const cpus = os.cpus();
  // cpus is an array of all cores. We need the average of all the cores, which gives us the cpu average.
  let idleMs = 0; // idle milliseconds
  let totalMs = 0; // total milliseconds
  // loop through each core (thread)
  cpus.forEach((aCore) => {
    // add every mode of the current core to totalMs
    totalMs += Object.values(aCore.times).reduce((sum, ms) => sum + ms, 0);
    // add the idle mode of this core to idleMs
    idleMs += aCore.times.idle;
  });
  return {
    idle: idleMs / cpus.length,
    total: totalMs / cpus.length,
  };
};

// The times property on cpus is time since boot, so we take the times "now" and 100ms later.
// Comparing them gives us the current load.
const getCpuLoad = (): Promise<number> =>
  new Promise((resolve) => {
    const start = cpuAverage(); // "now" value of load
    setTimeout(() => {
      const end = cpuAverage(); // value 100ms after "now"
      const idleDiff = end.idle - start.idle;
      const totalDiff = end.total - start.total;
      // calculate the % of the used cpu
      const percentOfCpu = 100 - Math.floor((100 * idleDiff) / totalDiff);
      resolve(percentOfCpu);
    }, 100);
  });

export const performanceLoadData = async (): Promise<MachinePerf> => {
  // What do we need to know FROM NODE about performance?
  const cpus = os.cpus(); // all cpus as an array
  // memory usage
  const totalMem = os.totalmem(); // in bytes
  const freeMem = os.freemem(); // in bytes
  const usedMem = totalMem - freeMem;
  const memUseage = Math.floor((usedMem / totalMem) * 100) / 100; // 2 decimal places
  // OS type
  const osType = os.type() === 'Darwin' ? 'Mac' : os.type();
  // uptime, in seconds
  const upTime = os.uptime();
  // CPU info: type, number of cores, clock speed
  const cpuType = cpus[0].model;
  const numCores = cpus.length;
  const cpuSpeed = cpus[0].speed;
  // current CPU load, in %
  const cpuLoad = await getCpuLoad();
  return {
    freeMem,
    totalMem,
    usedMem,
    memUseage,
    osType,
    upTime,
    cpuType,
    numCores,
    cpuSpeed,
    cpuLoad,
  };
};

// We need a way to identify this machine to the server, for front-end usage.
// We use the MAC address of the first internet-facing network interface, plus a random number
// so that several clients on the same machine show up as separate machines.
export const getMachineId = (): string => {
  const nI = os.networkInterfaces(); // a list of all network interfaces on this machine
  let base = os.hostname();
  // loop through all network interfaces until we find a non-internal one
  for (const interfaces of Object.values(nI)) {
    if (interfaces && interfaces.length > 0 && !interfaces[0].internal) {
      base = interfaces[0].mac;
      break;
    }
  }
  return base + Math.floor(Math.random() * 100000);
};
