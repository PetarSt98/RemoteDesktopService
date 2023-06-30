import React, { useState, useEffect } from 'react';
import DeviceList from './DeviceList';
import { useTokenExchangeHandler } from "../shared/useTokenExchangeHandler";
import { DownloadRdp } from './DownloadRdp/DownloadRdp';
import Swal from 'sweetalert2';
import { Form } from 'react-bootstrap';

interface UserSearchProps {
  token: string;
  userName: string;
}

const UserSearch: React.FC<UserSearchProps> = ({ token, userName }) => {
  const [deviceName, setDeviceName] = useState('');
  const [devices, setDevices] = useState<string[]>([]);
  const [searchClicked, setSearchClicked] = useState(false);
  const [searchSuccessful, setSearchSuccessful] = useState(false);
  const [exchangeToken, setExchangeToken] = useState("");
  useTokenExchangeHandler(token, setExchangeToken);

  const handleSearch = () => {
    setSearchClicked(true);
    const uppercasedDeviceName = deviceName.toUpperCase();
    fetch(`https://rds-back-new-rds-frontend.app.cern.ch/api/search_tabel/search?userName=${userName}&deviceName=${uppercasedDeviceName}`, {
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
        if (Array.isArray(data) && data.length > 0) {
          setDevices(data);
          setSearchSuccessful(true);
        } else {
          console.error("Expected an array but got:", typeof data);
          setDevices([]);
          setSearchSuccessful(false);
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
        setSearchSuccessful(false);
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
        const uppercasedDeviceName = deviceName.toUpperCase();
        fetch(`https://rds-back-new-rds-frontend.app.cern.ch/api/devices_tabel/remove?userName=${userName}&deviceName=${uppercasedDeviceName}&fetchToDeleteResource=${false}`, {
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
      }
    });
  };
  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleSearch();
  };
  return (
    <div className="card p-3 h-100">
      <h2 className="mb-3">Search for the device</h2>
      <Form onSubmit={handleFormSubmit}>
        <div className="input-group">
          <input 
            type="text" 
            value={deviceName} 
            onChange={e => setDeviceName(e.target.value)} 
            className="form-control"
            placeholder="Search device..."
          />
          <div className="input-group-append">
            <button 
              type="button" 
              onClick={handleSearch} 
              className="btn btn-outline-primary"
              title="Search device"
            >
              Search
            </button>
            {searchSuccessful && (
              <div className="d-flex ml-2">
                <DownloadRdp computerName={deviceName.toUpperCase()} />
                <button 
                  onClick={handleDelete} 
                  className="btn btn-outline-danger ml-2"
                  disabled={!searchSuccessful}
                  title="Remove device from user"
                >
                  Remove device
                </button>
              </div>
            )}
          </div>
        </div>
      </Form>
      {searchClicked && <DeviceList devices={devices} />}
    </div>
  );
}

export default UserSearch;
