import { useEffect, useRef } from 'react';
import type { PerfData } from '../../../shared/types';
import drawCircle from '../utilities/canvasLoadAnimation';

type CpuProps = { data: Pick<PerfData, 'cpuLoad'> };

const Cpu = ({ data }: CpuProps) => {
  const canvasEl = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawCircle(canvasEl.current, data.cpuLoad);
  }, [data.cpuLoad]);

  return (
    <div className="cpu col-3">
      <h3>CPU Load</h3>
      <div className="canvas-wrapper">
        <canvas ref={canvasEl} className="" width="200" height="200"></canvas>
        <div className="cpu-text">{data.cpuLoad}</div>
      </div>
    </div>
  );
};

export default Cpu;
