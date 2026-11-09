import moment from 'moment';
import type { PerfData } from '../../../shared/types';

type InfoProps = {
  data: Pick<PerfData, 'macA' | 'osType' | 'upTime' | 'cpuType' | 'cpuSpeed' | 'numCores'>;
};

const Info = ({ data }: InfoProps) => {
  return (
    <div className="col-sm-3 col-sm-offset-1 cpu-info">
      <h3>Operating System</h3>
      <div className="widget-text">{data.osType}</div>
      <h3>Time Online</h3>
      <div className="widget-text">{moment.duration(data.upTime, 'seconds').humanize()}</div>
      <h3>Processor information</h3>
      <div className="widget-text">
        <strong>Type:</strong> {data.cpuType}
      </div>
      <div className="widget-text">
        <strong>Number of Cores:</strong> {data.numCores}
      </div>
      <div className="widget-text">
        <strong>Clock Speed:</strong> {data.cpuSpeed}
      </div>
    </div>
  );
};

export default Info;
