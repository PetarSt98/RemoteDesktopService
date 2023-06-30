// components/DeviceList.tsx
import React from 'react';

type DeviceListProps = {
  devices: string[];
};

const DeviceList: React.FC<DeviceListProps> = ({ devices }) => {
  if (!devices.length) {
    return <p>No users found for the device.</p>;
  }
  
  return (
    <table className="table table-striped mt-3">
      <thead>
        <tr>
          <th>Users and Owners</th>
        </tr>
      </thead>
      <tbody>
        {devices.map((device, index) => (
          <tr key={index}>
            <td>{device}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DeviceList;
