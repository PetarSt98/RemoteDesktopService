import React, { useState, useEffect } from 'react';
import CreateUser from './CreateUser';
import { useTokenExchangeHandler } from "../shared/useTokenExchangeHandler";
import Swal from 'sweetalert2';
import { DownloadRdp } from './DownloadRdp/DownloadRdp';
import { Button } from 'react-bootstrap';

interface UserDevicesProps {
  token: string;
  userName: string;
}

interface DeviceItemProps {
  device: string;
  handleDelete: () => void;
}

const DeviceItem: React.FC<DeviceItemProps> = ({ device, handleDelete }) => {
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
      <div className="d-flex">
        <DownloadRdp computerName={device} />
        <button onClick={confirmDelete} className="btn btn-outline-danger btn-sm ml-3" title="Remove device from user">
          ➖
        </button>
      </div>
    </li>
  );
};

const UserDevices: React.FC<UserDevicesProps> = ({ token, userName }) => {
  const [devices, setDevices] = useState<string[]>([]);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [exchangeToken, setExchangeToken] = useState("");
  useTokenExchangeHandler(token, setExchangeToken);

  useEffect(() => {
    if (exchangeToken.length > 0) {
      fetch(`https://localhost:44354/api/devices_tabel/search?userName=${userName}`, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + exchangeToken
        }
      })
        .then(response => response.json())
        .then(data => {
          if (Array.isArray(data)) {
            setDevices(data);
          } else {
            console.error("Expected an array but got:", typeof data);
            setDevices([]);
          }
        })
        .catch(error => {
          console.error(error);
          setDevices([]);
        });
    }
  }, [userName, exchangeToken]);

  const deleteDevice = (device: string) => {
    fetch(`https://localhost:44354/api/devices_tabel/remove?userName=${userName}&deviceName=${device}`, {
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

  return (
    <div className="card p-3 h-100">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Listed all devices with your access</h4>
        {showCreateUser ? (
          <Button 
            variant="outline-secondary"
            onClick={() => setShowCreateUser(!showCreateUser)} 
          >
            Hide add new device
          </Button>
        ) : (
          <Button 
            variant="outline-primary"
            onClick={() => setShowCreateUser(!showCreateUser)} 
            title="Open tab for adding a new device to the user"
          >
            ➕ Add new device
          </Button>
        )}
      </div>
  
      {devices.length === 0 ? (
        <p>No devices found for the user.</p>
      ) : (
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
                {/* <td>{device}</td> */}
                <td>
                  <DeviceItem device={device} handleDelete={() => deleteDevice(device)} />
                </td>
              </tr>
            ))}
            {showCreateUser && (
              <tr>
                <td colSpan={2}><CreateUser token={token} userName={userName} /></td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};


export default UserDevices;
