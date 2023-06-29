import React, { useState, useEffect } from 'react';
import DeviceList from './DeviceList';
import { useTokenExchangeHandler } from "../shared/useTokenExchangeHandler";
import Swal from 'sweetalert2';

interface UserSearchProps {
  token: string;
  userName: string;
}

const UserSearch: React.FC<UserSearchProps> = ({ token, userName }) => {
  const [deviceName, setDeviceName] = useState('');
  const [devices, setDevices] = useState<string[]>([]);
  const [searchClicked, setSearchClicked] = useState(false);
  const [exchangeToken, setExchangeToken] = useState("");
  useTokenExchangeHandler(token, setExchangeToken);

  const handleSearch = () => {
    setSearchClicked(true);
    fetch(`https://localhost:44354/api/search_tabel/search?userName=${userName}&deviceName=${deviceName}`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " +  exchangeToken
      }
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          return response.text().then(text => {
            throw new Error(text);
          });
        }
      })
      .then(data => {
        // Check if data is an array before setting state
        if (Array.isArray(data)) {
          setDevices(data);
        } else {
          console.error("Expected an array but got:", typeof data);
          setDevices([]);
        }
      })
      .catch(error => {
        console.error(error);
        if (error.message.includes("owner")) {
          Swal.fire({
            title: 'Unauthorized device!',
            text: error.message,
            icon: 'error'
          });
        } else {
          Swal.fire({
            title: 'Warning!',
            text: error.message,
            icon: 'info'
          });
        }
        setDevices([]);
      });
  };

  const handleDelete = () => {
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
        fetch(`https://localhost:44354/api/devices_tabel/remove?userName=${userName}&deviceName=${deviceName}`, {
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
            } else {
              color = 'error';
            }
            Swal.fire({
              text: data,
              icon: color
            });
          })
          .catch(error => {
            console.error(error);
            Swal.fire({
              text: "Failed to delete device",
              icon: 'error'
            });
          });
      }
    });
  };

  return (
    <div className="card p-3 h-100">
      <h2 className="mb-3">Search for the device</h2>
      <div className="input-group">
        <input 
          type="text" 
          value={deviceName} 
          onChange={e => setDeviceName(e.target.value)} 
          className="form-control"
          placeholder="Search device..."
        />
        <div className="input-group-append">
          <button onClick={handleSearch} className="btn btn-outline-primary">Search</button>
          {searchClicked && (
            <button 
              onClick={handleDelete} 
              className="btn btn-outline-danger ml-2"
              disabled={!searchClicked}
              title="Remove device from user"
            >
              ➖
            </button>
          )}
        </div>
      </div>
      {searchClicked && <DeviceList devices={devices} />}
    </div>
  );
}

export default UserSearch;
