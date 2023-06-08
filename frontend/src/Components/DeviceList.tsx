// components/DeviceList.tsx
import React from 'react';

type DeviceListProps = {
  devices: string[];
};

const DeviceList: React.FC<DeviceListProps> = ({ devices }) => {
  return (
    <div className="card p-3">
      <h2 className="mb-3">User Devices</h2>
      {devices.map((device, index) => (
        <p key={index}>{device}</p>
      ))}
    </div>
  );
}

export default DeviceList;
