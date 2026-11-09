import { useEffect, useRef } from 'react';
import type { PerfData } from '../../../shared/types';
import drawCircle from '../utilities/canvasLoadAnimation';

type MemProps = { data: Pick<PerfData, 'freeMem' | 'memUseage' | 'totalMem'> };

const Mem = ({ data }: MemProps) => {
  const { freeMem, memUseage, totalMem } = data;

  const memRef = useRef<HTMLCanvasElement>(null);

  const totalMemInGB = Math.floor((totalMem / 1073741824) * 100) / 100;
  const freeMemInGB = Math.floor((freeMem / 1073741824) * 100) / 100;
  const memPercent = Math.round(memUseage * 100);

  useEffect(() => {
    drawCircle(memRef.current, memPercent);
  }, [memPercent]);

  return (
    <div className="mem col-3">
      <h3>Memory Usage</h3>
      <div className="canvas-wrapper">
        <canvas ref={memRef} width="200" height="200"></canvas>
        <div className="mem-text">{memPercent}%</div>
      </div>
      <div>Total Memory: {totalMemInGB}gb</div>
      <div>Free Memory: {freeMemInGB}gb</div>
    </div>
  );
};

export default Mem;
