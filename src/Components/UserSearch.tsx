import React, { useState, useEffect, useImperativeHandle, forwardRef   } from 'react';
import DeviceList from './DeviceList';
import { useTokenExchangeHandler } from "../shared/useTokenExchangeHandler";
import { DownloadRdp } from './DownloadRdp/DownloadRdp';
import Swal from 'sweetalert2';
import { Form, Collapse, Button, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faPlus } from '@fortawesome/free-solid-svg-icons';

export interface UserSearchRef {
  handleSearch: () => void;
}

interface UserSearchProps {
  token: string;
  userName: string;
  primaryAccount: string;
  deviceNameForEdit: string;
  onEditComplete: () => void;
}

const UserSearch = forwardRef<UserSearchRef, UserSearchProps>((props, ref) => {
  const { token, userName, primaryAccount, deviceNameForEdit } = props;
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
  const [isEditComplete, setIsEditComplete] = useState(false);
  useTokenExchangeHandler(token, setExchangeToken);
  useEffect(() => {
    if (deviceNameForEdit) {
      setDeviceName(deviceNameForEdit);
      handleSearch(deviceNameForEdit);
    }
  }, [deviceNameForEdit]);

  useImperativeHandle(ref, () => ({
    handleSearch
  }));
  const onEditComplete = () => {
    setIsEditComplete(true);
    // Any other logic that you wish to include when editing is complete.
  };
  const handleSearch = (deviceNameForHandle?: string) => {
    setSearchClicked(true);
    setShowAddUser(false);
    const deviceNameToUse = deviceNameForHandle || deviceName;
    if (deviceNameToUse.length === 0) {
        Swal.fire({
            title: 'Empty device name!',
            text: 'Enter a device name',
            icon: 'warning'
        });
    } 
    else 
    {
        const uppercasedDeviceName = deviceNameToUse.toUpperCase();
        fetch(`https://rdgateway-backend-test.app.cern.ch/api/search_tabel/search?userName=${userName}&deviceName=${uppercasedDeviceName}`, {
            method: "GET",
            headers: {
                Authorization: "Bearer " + exchangeToken
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
                    setSearchedDeviceName(deviceNameToUse);
                    // onEditComplete();
                    props.onEditComplete();
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

  const handleClearSearch = () => {
    setDeviceName(''); // clear the input
    setDevices([]); // clear the search results
    setSearchSuccessful(false); // indicate that there's no successful search
    setSearchClicked(false); // reset the search click state
  };

  const handleDelete = (UserNameToDelete: string) => {
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
        fetch(`https://rdgateway-backend-test.app.cern.ch/api/devices_tabel/remove?userName=${UserNameToDelete}&deviceName=${uppercasedDeviceName}&fetchToDeleteResource=${false}`, {
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
  var signedInUser = "";
  if (primaryAccount === "Primary")
  {
    signedInUser = "Primary";
  }
  else
  {
    signedInUser = userName;
  }


  const handleNewUserSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    // setNewUserLoading(true);
    setIsLoading(true);
    try{
      const response = await fetch('https://rdgateway-backend-test.app.cern.ch/api/add_pop_up/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: "Bearer " +  exchangeToken
        },
        body: JSON.stringify({ userName: newUserName, deviceName: searchedDeviceName, SignedInUser: signedInUser,  AddDeviceOrUser: 'user' }),  // use "deviceName" instead of "searchedDeviceName" in the request body
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
    <h4 className="card-title">Manage user access for a configured device</h4>
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
        {deviceName && 
          <button 
            type="button"  // Ensure this button does not submit the form
            className="btn btn-outline-secondary"
            onClick={(e) => {
                e.preventDefault();  
                handleClearSearch();
            }}
            title="Clear Search"
          >  
            X
          </button>
        }
          <button 
            type="submit"
            className="btn btn-outline-primary"
            title="Search for a device for which you want to manage the users"
          >  
            Manage users  
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
            onClick={() => handleDelete(userName)}
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
    {searchClicked && <DeviceList devices={devices} handleDelete={handleDelete} searchedDeviceName={searchedDeviceName} />}
  </div>
);
});


export default UserSearch;
