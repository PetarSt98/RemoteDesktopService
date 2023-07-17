import React, { useState, useEffect } from 'react';
import DeviceList from './DeviceList';
import { useTokenExchangeHandler } from "../shared/useTokenExchangeHandler";
import { DownloadRdp } from './DownloadRdp/DownloadRdp';
import Swal from 'sweetalert2';
import { Form, Collapse, Button, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faPlus } from '@fortawesome/free-solid-svg-icons';


interface UserSearchProps {
  token: string;
  userName: string;
}

const UserSearch: React.FC<UserSearchProps> = ({ token, userName }) => {
  const [deviceName, setDeviceName] = useState('');
  const [searchedDeviceName, setSearchedDeviceName] = useState("");
  const [devices, setDevices] = useState<string[]>([]);
  const [searchClicked, setSearchClicked] = useState(false);
  const [searchSuccessful, setSearchSuccessful] = useState(false);
  const [exchangeToken, setExchangeToken] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserMessage, setNewUserMessage] = useState("");
  const [newUserMessageType, setNewUserMessageType] = useState("");
  const [newUserLoading, setNewUserLoading] = useState(false);
  const [messageType, setMessageType] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false)
  useTokenExchangeHandler(token, setExchangeToken);

  const handleSearch = () => {
    setSearchClicked(true);
    setShowAddUser(false);

    if (deviceName.length === 0){
      Swal.fire({
        title: 'Empty device name!',
        text: 'Enter a device name',
        icon: 'warning'
      });
    }
    else{
      const uppercasedDeviceName = deviceName.toUpperCase();    
      fetch(`https://rdgateway-backend.app.cern.ch/api/search_tabel/search?userName=${userName}&deviceName=${uppercasedDeviceName}`, {
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
            setSearchedDeviceName(deviceName);
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
    }
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
        const uppercasedDeviceName = searchedDeviceName.toUpperCase();
        fetch(`https://rdgateway-backend.app.cern.ch/api/devices_tabel/remove?userName=${userName}&deviceName=${uppercasedDeviceName}&fetchToDeleteResource=${false}`, {
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
  // const handleFormSubmit = (event: React.FormEvent) => {
  //   event.preventDefault();
  //   handleSearch();
  // };
  const handleNewUserSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    // setNewUserLoading(true);
    setIsLoading(true);
    try{
      const response = await fetch('https://rdgateway-backend.app.cern.ch/api/add_pop_up/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: "Bearer " +  exchangeToken
        },
        body: JSON.stringify({ userName: newUserName, deviceName: searchedDeviceName, AddDeviceOrUser: 'user' }),  // use "deviceName" instead of "searchedDeviceName" in the request body
      });
      const data = await response.text();
      if (data === 'Successfully added the user!') {
        console.log('Successfully added the user!');
        setMessageType('success');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        console.error('Failed to add user');
        setMessageType('danger');
      }

      setMessage(data);

    } catch (error) {
      setMessageType('danger');
      setMessage('An error occurred while creating the user');
    } finally {
      setIsLoading(false);
      setDeviceName('');
    }
};

return (
  <div className="card p-3 h-100">
    <h4 className="card-title">Search for the specific device</h4>
    <Form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Enter device name..."
          value={deviceName}
          onChange={(e) => setDeviceName(e.target.value)}
        />
        <div className="input-group-append">
          <button 
            type="submit"
            className="btn btn-outline-primary"
            title="Search device"
          >  
            Search  
          </button>
        </div>
      </div>
    </Form>
    {searchSuccessful && (
      <div className="d-flex align-items-center">
        <strong>Device: {searchedDeviceName.toUpperCase()}</strong>
        <hr className="flex-grow-1 mx-3" style={{ border: "1px solid black" }} />
        <div>
          <Button
            variant={showAddUser ? "outline-secondary" : "outline-primary"}
            onClick={() => setShowAddUser(!showAddUser)}
            aria-controls="example-collapse-text"
            aria-expanded={showAddUser}
            className="btn-sm ml-3"
            title={showAddUser ? "Hide the tab for adding new user to the device" : "Open the tab for adding new user to the device"}
          >
            {showAddUser ? "Hide add new user" : (<><FontAwesomeIcon icon={faPlus} /> Add new user</>)}
          </Button>
          <DownloadRdp computerName={searchedDeviceName.toUpperCase()} />
          <Button
            variant="outline-danger"
            onClick={handleDelete}
            className="btn-sm ml-3"
            title="Remove device from user"
            disabled={!searchSuccessful}
          >
            <FontAwesomeIcon icon={faTrashAlt} />
          </Button>
        </div>
      </div>
    )}
    <Collapse in={showAddUser}>
      <div id="example-collapse-text">
        <Form onSubmit={handleNewUserSubmit}>
          <div className="input-group mb-3">
            <input
              type="text"
              value={newUserName}
              onChange={e => setNewUserName(e.target.value)}
              className="form-control"
              placeholder="New user name..."
              disabled={isLoading} // disable the input while loading
            />
            <div className="input-group-append">
              <Button variant="outline-primary" type="submit" title="Add new user to device" disabled={isLoading}>
                {isLoading ? (  // Add a spinner when loading
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                ) : (
                  "Add"
                )}
              </Button>
            </div>
          </div>
        </Form>
        {/* Display the response message in an alert */}
        {message && (
          <div className={`alert alert-${messageType}`} role="alert">
            {message}
          </div>
        )}
      </div>
    </Collapse>
    {searchClicked && <DeviceList devices={devices} />}
  </div>
);
};


export default UserSearch;
