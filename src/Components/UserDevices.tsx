import React, { useState, useEffect } from 'react';
import CreateUser from './CreateUser';
import { useTokenExchangeHandler } from "../shared/useTokenExchangeHandler";
import Swal from 'sweetalert2';
import { DownloadRdp } from './DownloadRdp/DownloadRdp';
import { Button, Collapse  } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faPlus, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';


interface UserDevicesProps {
  token: string;
  userName: string;
}

interface DeviceItemProps {
  device: string;
  status: boolean;
  handleDelete: () => void;
}

const DeviceItem: React.FC<DeviceItemProps> = ({ device, status, handleDelete }) => {
  const confirmDelete = () => {
    Swal.fire({
      title: 'Confirmation',
      text: 'Are you sure you want to remove this device from the user?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        handleDelete();
      }
    });
  };

  return (
    <li className="d-flex justify-content-between align-items-center">
      {device}
      <hr className="flex-grow-1 mx-3" />
      <div className="d-flex align-items-center">
        <span 
          className={`btn btn-sm ${status ? 'btn-success' : 'btn-danger'}`} 
          title={status ? 'The device is configured for remote access' : 'This device is not yet configured for remote access'}
          style={{ cursor: 'default' }} 
        >
          {status ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faTimes} />}
        </span>
        <DownloadRdp computerName={device} />
        <button onClick={confirmDelete} className="btn btn-outline-danger btn-sm ml-3" title="Remove device from user">
          <FontAwesomeIcon icon={faTrashAlt} /> 
        </button>
      </div>
    </li>
  );
};

const UserDevices: React.FC<UserDevicesProps> = ({ token, userName }) => {
  const [devices, setDevices] = useState<string[]>([]);
  const [deviceStatus, setDeviceStatus] = useState<{ [key: string]: boolean }>({});
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [exchangeToken, setExchangeToken] = useState("");
  const [isAddDeviceVisible, setIsAddDeviceVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // New state for add device visibility
  useTokenExchangeHandler(token, setExchangeToken);
  console.log("Token: ", exchangeToken)
  useEffect(() => {
    if (exchangeToken.length > 0) {
      fetch(`https://rdgateway-backend.app.cern.ch/api/devices_tabel/search?userName=${userName}`, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + exchangeToken
        }
      })
        .then(response => response.json())
        .then(data => {
          setIsLoading(false);
          if (Array.isArray(data)) {
            setDevices(data);
            checkDeviceStatuses(data); // Get device status right after setting the devices
          } else {
            console.error("Expected an array but got:", typeof data);
            setDevices([]);
          }
        })
        .catch(error => {
          console.error(error);
          setDevices([]);
          setIsLoading(false);
        });
    }
  }, [userName, exchangeToken]);

  const checkDeviceStatuses = (deviceNames: string[]) => {
    fetch(`https://rdgateway-backend.app.cern.ch/api/devices_tabel/check`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json', 
        Authorization: "Bearer " + exchangeToken
      },
      body: JSON.stringify({ userName, deviceNames }), // Include userName and deviceNames in request body
    })
    .then(response => response.json())
    .then(statuses => {
      console.log('Received statuses:', statuses); // Added console.log here
      const newDeviceStatus: { [key: string]: boolean } = {};
      for (let i = 0; i < deviceNames.length; i++) {
        newDeviceStatus[deviceNames[i]] = statuses[i];
      }
      setDeviceStatus(newDeviceStatus);
      })
      .catch(error => {
        console.error(error);
      });
  };

  const deleteDevice = (device: string) => {
    fetch(`https://rdgateway-backend.app.cern.ch/api/devices_tabel/remove?userName=${userName}&deviceName=${device}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + exchangeToken
      }
    })
      .then(response => response.text())
      .then(data => {
        let color: 'success' | 'error';
        if (data === "Successful user removal!") {
          color = 'success';
          Swal.fire({
            text: data,
            icon: color
          }).then(() => {
            window.location.reload();
          });
        } else {
          color = 'error';
          Swal.fire({
            text: data,
            icon: color
          });
        }
      })
      .catch(error => {
        console.error(error);
        Swal.fire({
          text: "Failed to delete device",
          icon: 'error'
        });
      });
  };
  const handleToggleAddDevice = () => {
    setShowCreateUser(!showCreateUser);
    setIsAddDeviceVisible(true);
  };
  return (
    <div className="card p-3 h-100">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Your remote-enabled devices</h4>
        {!showCreateUser ? (
          <Button 
            variant="outline-primary"
            onClick={handleToggleAddDevice} 
            title="Open tab for adding a new device to the user"
          >
            <FontAwesomeIcon icon={faPlus} />  Add new device
          </Button>
        ) : (
          <Button 
            variant="outline-secondary"
            onClick={handleToggleAddDevice}
            title="Hide tab for adding a new device to the user"
          >
            Hide add new device
          </Button>
        )}
      </div>
  
      <Collapse in={showCreateUser}>
        <div className="mt-3">
          <CreateUser token={token} userName={userName} />
        </div>
      </Collapse>
  
      {devices.length === 0 && !showCreateUser && !isLoading && (
        <div className="alert alert-info" role="alert">
          No devices found for the user.
        </div>
      )}
  
      {devices.length > 0 && (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Devices</th>
              {/* <th>Action</th> */}
            </tr>
          </thead>
          <tbody>
            {devices.map((device, index) => (
              <tr key={index}>
                <td>
                  <DeviceItem device={device} handleDelete={() => deleteDevice(device)} status={deviceStatus[device]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  
  
};


export default UserDevices;
