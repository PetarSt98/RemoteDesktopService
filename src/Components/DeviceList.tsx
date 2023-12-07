import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faLock, faUnlockAlt } from '@fortawesome/free-solid-svg-icons';

type DeviceListProps = {
  devices: string[];
  handleDelete: (deviceName: string) => void;
  searchedDeviceName: string;
  signedInUser: string;
  exchangeToken: string;
};

const DeviceList: React.FC<DeviceListProps> = ({ devices, handleDelete, searchedDeviceName, signedInUser, exchangeToken }) => {
  const [deviceLockStatus, setDeviceLockStatus] = useState<{ [deviceName: string]: boolean }>({});

  useEffect(() => {
    // Fetch initial lock statuses

    if (!searchedDeviceName || devices.length === 0) {
      return; // Exit the useEffect if conditions are not met
    }

    fetch('https://rdgateway-backend.app.cern.ch/api/search_tabel/acces_init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: "Bearer " + exchangeToken },
      body: JSON.stringify({ device: searchedDeviceName, Users: devices }),
    })
    .then(response => response.json())
    .then(data => {
      // Assuming data is an object with device names as keys and lock statuses as values
      setDeviceLockStatus(data);
    })
    .catch(error => console.error('Error fetching initial lock statuses:', error));
  }, [devices, searchedDeviceName, signedInUser, exchangeToken]);

  const handleAccess = (device:string) => {
    const currentStatus = deviceLockStatus[device];
    fetch('https://rdgateway-backend.app.cern.ch/api/search_tabel/access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: "Bearer " + exchangeToken },
      body: JSON.stringify({ signedInUser: signedInUser, searchedDeviceName: searchedDeviceName, user: device, lockStatus: !currentStatus }),
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(() => {
      setDeviceLockStatus(prevStatus => ({ ...prevStatus, [device]: !currentStatus }));
    })
    .catch(error => console.error('Error toggling device access:', error));
  };

  if (!devices.length) {
    return <p>No users found for the device.</p>;
  }

  return (
    <table className="table table-striped mt-3">
      <thead>
        <tr>
          <th>List of users with access for a device</th>
          <th style={{ width: '1%', whiteSpace: 'nowrap' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {devices.map((device, index) => (
          <tr key={index}>
            <td>{device}</td>
            <td style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
  variant={!deviceLockStatus[device] ? "outline-secondary" : "outline-primary"}
  onClick={() => handleAccess(device)}
  className="btn-sm mr-2"
  title="Configure device access"
>
  <FontAwesomeIcon icon={!deviceLockStatus[device] ? faLock : faUnlockAlt} />
</Button>
              <Button
                variant="outline-danger"
                onClick={() => handleDelete(device)}
                className="btn-sm"
                title="Remove device from user"
              >
                <FontAwesomeIcon icon={faTrashAlt} />
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DeviceList;
