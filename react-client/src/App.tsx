import { useEffect, useState } from 'react';
import type { PerfData } from '../../shared/types';
import socket from './utilities/socketConnection';
import Widget from './perfDataComponents/Widget';

function App() {
  const [performanceData, setPerformanceData] = useState<Record<string, PerfData>>({});

  useEffect(() => {
    // the latest data of every machine, kept OUTSIDE of state so a new message does not cause a re-render
    const perfMachineData: Record<string, PerfData> = {};

    // one line of data came through for one machine: update our local variable
    const onPerfData = (data: PerfData) => {
      perfMachineData[data.macA] = data;
    };
    socket.on('perfData', onPerfData);

    // once per second, copy the data into state. That is what re-renders the widgets
    const interval = setInterval(() => {
      setPerformanceData({ ...perfMachineData });
    }, 1000);

    return () => {
      socket.off('perfData', onPerfData);
      clearInterval(interval);
    };
  }, []); // run once, after the first render

  const widgets = Object.values(performanceData).map((d) => <Widget data={d} key={d.macA} />);

  return <div className="container">{widgets}</div>;
}

export default App;
