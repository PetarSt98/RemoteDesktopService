import React, { useState, useEffect } from 'react';
import CreateUser from './CreateUser';
import { useTokenExchangeHandler } from "../shared/useTokenExchangeHandler";
import Swal from 'sweetalert2';

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
      <button onClick={confirmDelete} className="btn btn-outline-danger btn-sm" title="Remove device from user">
        ➖
      </button>
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
        let color;
        if (data === "Successful user removal!") {
          color = 'success'; // Green
        } else {
          color = 'error'; // Red
        }
        Swal.fire({
          text: data,
          icon: color as 'success' | 'error'
        }).then(() => {
          if (data !== "Successful user removal!") {
            window.location.reload();
          }
        });
        setDevices(devices.filter(d => d !== device));
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
        <h2>User's devices</h2>
        <button onClick={() => setShowCreateUser(!showCreateUser)} className="btn btn-outline-primary">
          ➕ Add new device
        </button>
      </div>
      {showCreateUser && <CreateUser token={token} userName={userName} />}
      {devices.length === 0 ? (
        <p>No devices found for the user.</p>
      ) : (
        <ul>
          {devices.map((device, index) => (
            <DeviceItem key={index} device={device} handleDelete={() => deleteDevice(device)} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserDevices;
