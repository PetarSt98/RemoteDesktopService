import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faLock, faUnlockAlt } from '@fortawesome/free-solid-svg-icons';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

type DeviceListProps = {
  devices: string[];
  handleDelete: (deviceName: string) => void;
  searchedDeviceName: string;
  signedInUser: string;
  exchangeToken: string;
  searchSuccessful: boolean;
};

const DeviceList: React.FC<DeviceListProps> = ({ devices, handleDelete, searchedDeviceName, signedInUser, exchangeToken, searchSuccessful }) => {
  const [deviceLockStatus, setDeviceLockStatus] = useState<{ [deviceName: string]: boolean }>({});
  const [loading, setLoading] = useState<{ [deviceName: string]: boolean }>({});

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

  const handleAccess = (device: string) => {
    setLoading(prev => ({ ...prev, [device]: true }));
    const currentStatus = deviceLockStatus[device];
    fetch('https://rdgateway-backend.app.cern.ch/api/search_tabel/access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: "Bearer " + exchangeToken },
      body: JSON.stringify({ signedInUser: signedInUser, searchedDeviceName: searchedDeviceName, user: device, lockStatus: !currentStatus }),
    })
    .then(response => {
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(`You are not an owner or a main user of the device: ${searchedDeviceName}, you cannot edit users!`);
        } else {
          throw new Error('Internal error');
        }
      }
      return response.json();
    })
    .then(() => {
      setDeviceLockStatus(prevStatus => ({ ...prevStatus, [device]: !currentStatus }));
      setLoading(prev => ({ ...prev, [device]: false }));
    })
    .catch(error => {
      console.error('Error toggling device access:', error);
      setLoading(prev => ({ ...prev, [device]: false }));
      Swal.fire({
        icon: 'error',
        title: 'Access toggling has failed!',
        text: error.message,
      });
    });
};

  if (!devices.length) {
    if (searchSuccessful)
    {
      return <p style={{ margin: '20px 0', padding: '10px', backgroundColor: '#f0f0f0', border: '1px solid #cccccc', color: '#666666', textAlign: 'center', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold' }}>No users found for the device.</p>;

    }
    else
    {
      return <p style={{ margin: '20px 0', padding: '10px', backgroundColor: '#ffeded', border: '1px solid #ff5c5c', color: '#ff5c5c', textAlign: 'center', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold' }}>No device found.</p>;
    }
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
                disabled={loading[device]}
              >
                {loading[device] ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  <FontAwesomeIcon icon={!deviceLockStatus[device] ? faLock : faUnlockAlt} />
                )}
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
