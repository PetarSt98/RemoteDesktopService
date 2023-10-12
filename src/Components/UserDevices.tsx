import React, { useState, useEffect } from 'react';
import CreateUser from './CreateUser';
import { useTokenExchangeHandler } from "../shared/useTokenExchangeHandler";
import Swal from 'sweetalert2';
import { DownloadRdp } from './DownloadRdp/DownloadRdp';
import { Button, Modal, Collapse  } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faPlus, faCheck, faTimes, faEdit, faQuestion  } from '@fortawesome/free-solid-svg-icons';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FiSearch, FiX } from 'react-icons/fi';

interface UserDevicesProps {
  token: string;
  userName: string;
  onEditDevice?: (deviceName: string) => void;
}

interface DeviceItemProps {
  device: string;
  status: boolean;
  statusUncompleted: boolean;
  date: string;
  handleDelete: () => void;
  handleConfirmation: () => void;
  handleEdit: () => void;
}

const DeviceItem: React.FC<DeviceItemProps> = ({ device, status, statusUncompleted, date, handleDelete, handleConfirmation, handleEdit }) => {
  const confirmDelete = () => {
    Swal.fire({
      title: 'Removal Confirmation',
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

  const confirmEditUser = () => {
    // Swal.fire({
    //   title: 'Confirmation',
    //   text: 'Are you sure you want to remove this device from the user?',
    //   icon: 'question',
    //   showCancelButton: true,
    //   confirmButtonText: 'Yes',
    //   cancelButtonText: 'No',
    //   reverseButtons: true
    // }).then((result) => {
    //   if (result.isConfirmed) {
    //     handleEdit();
    //   }
    // });
    handleEdit();
  };

  const callConfirmRequest = () =>
  {
    handleConfirmation();
  };

  return (
    <li className="d-flex justify-content-between align-items-center">
    <span className="d-flex align-items-center">
        <span 
          className={
            statusUncompleted 
            ? 'btn btn-sm btn-warning' 
            : `btn btn-sm ${status ? 'btn-success' : 'btn-danger'}`
          } 
          title={
            statusUncompleted 
            ? 'The device configuration is pending' 
            : (status ? 'The device is configured for remote access' : 'This device is not yet configured for remote access')
          }
          style={{ cursor: 'default', marginRight: '10px' }}
        >
          {statusUncompleted 
            ? <FontAwesomeIcon icon={faQuestion} /> 
            : (status ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faTimes} />)
          }
        </span>
          <span title={`Date: ${date}`}>
            {device}
        </span>
    </span>
      <hr className="flex-grow-1 mx-3" />
      <div className="d-flex align-items-center">
      {statusUncompleted && (
          <Button variant="outline-secondary" size="sm" className="ml-3" onClick={callConfirmRequest} title="Confirm request for this device">
            Mark as Synchronized
          </Button>
        )}
        <Button variant="outline-primary" size="sm" className="ml-3" onClick={confirmEditUser} title="Manage users for this device" style={{ marginLeft: '4px' }}>
          <FontAwesomeIcon icon={faEdit} /> 
        </Button>
        <DownloadRdp computerName={device} />
        <button onClick={confirmDelete} className="btn btn-outline-danger btn-sm ml-3" title="Remove device from user" style={{ marginLeft: '4px' }}>
          <FontAwesomeIcon icon={faTrashAlt} /> 
        </button>
      </div>
    </li>
  );
};

const UserDevices: React.FC<UserDevicesProps> = ({ token, userName, onEditDevice  }) => {
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadDeviceName, setDownloadDeviceName] = useState("");
  const [devices, setDevices] = useState<string[]>([]);
  const [deviceStatus, setDeviceStatus] = useState<{ [key: string]: boolean }>({});
  const [deviceUncompleteStatus, setDeviceUncompleteStatus] = useState<{ [key: string]: boolean }>({});
  const [deviceDates, setDeviceDates] = useState<{ [key: string]: string }>({});
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [exchangeToken, setExchangeToken] = useState("");
  const [isAddDeviceVisible, setIsAddDeviceVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // New state for add device visibility
  const [searchTerm, setSearchTerm] = useState(""); // New state for the search term
  const [filteredDevices, setFilteredDevices] = useState<string[]>([]); // New state for filtered devices
  const [isSearchVisible, setIsSearchVisible] = useState(false); // New state for search visibility

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
            checkDeviceStatuses(data);
            checkDeviceDates(data);
            checkDeviceUncompletedStatuses(data); // Get device status right after setting the devices
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
  console.log(onEditDevice);

  const editUser = (device: string) => {
    console.log(onEditDevice);
    onEditDevice && onEditDevice(device);
  };

  useEffect(() => {
    // Filter devices based on the search term
    const filtered = devices.filter(device => device.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredDevices(filtered);
  }, [searchTerm, devices]);

  const handleDownloadDeviceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDownloadDeviceName(e.target.value);
  };

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

  const checkDeviceDates = (deviceNames: string[]) => {
    fetch(`https://rdgateway-backend-test.app.cern.ch/api/devices_tabel/date_check`, {
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
      const deviceDates: { [key: string]: string } = {};
      for (let i = 0; i < deviceNames.length; i++) {
        deviceDates[deviceNames[i]] = statuses[i];
      }
      setDeviceDates(deviceDates);
      })
      .catch(error => {
        console.error(error);
      });
  };

  const checkDeviceUncompletedStatuses = (deviceNames: string[]) => {
    fetch(`https://rdgateway-backend.app.cern.ch/api/devices_tabel/uncompletedCheck`, {
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
      const newDeviceUncompleteStatus: { [key: string]: boolean } = {};
      for (let i = 0; i < deviceNames.length; i++) {
        newDeviceUncompleteStatus[deviceNames[i]] = statuses[i];
      }
      setDeviceUncompleteStatus(newDeviceUncompleteStatus);
      })
      .catch(error => {
        console.error(error);
      });
  };

  const confirmRequest = (device: string) => {
    Swal.fire({
      title: 'Confirm Manual Synchronization',
      text: 'Have you manually updated the "Remote Desktop Users" local group on this device and wish to mark it as synchronized?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`https://rdgateway-backend.app.cern.ch/api/devices_tabel/confirm?userName=${userName}&deviceName=${device}`, {
          method: "GET",
          headers: {
            Authorization: "Bearer " + exchangeToken // Note: You may need to get exchangeToken from the parent component
          }
        })
        .then(response => response.text())
        .then(data => {
          if (data === "Successful user confirmation!") {
            Swal.fire({
              text: data,
              icon: 'success'
            }).then(() => {
              window.location.reload();
            });
          } else {
            Swal.fire({
              text: data,
              icon: 'error'
            });
          }
        })
        .catch(error => {
          console.error(error);
          Swal.fire({
            text: "Failed to confirm the request",
            icon: 'error'
          });
        });
      }
    });
  };

  const deleteDevice = (device: string) => {
    fetch(`https://rdgateway-backend.app.cern.ch/api/devices_tabel/remove?userName=${userName}&deviceName=${device}&signedInUser=${userName}&primaryUser=${userName}&addDeviceOrUser=device`, {
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
      </div>
    
      <div className="d-flex justify-content-between align-items-center mb-2">
      <Button
      variant={isSearchVisible ? "outline-secondary" : "outline-primary"}
      onClick={() => {
        if (isSearchVisible) {
          setSearchTerm('');  // Clear searchTerm when hiding the search bar
        }
        setIsSearchVisible(!isSearchVisible);
      }}
      title="Toggle Search Bar"
    >
      {isSearchVisible ? <FiX /> : <FiSearch />}
      {isSearchVisible ? " Hide Search" : " Search"}
    </Button>
        <div>
          {!showCreateUser ? (
            <Button
              variant="outline-primary"
              onClick={handleToggleAddDevice}
              title="Open tab for adding a new device to the user"
            >
              <FontAwesomeIcon icon={faPlus} /> Add new device
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
        <Button
          variant="outline-primary"
          onClick={() => setShowDownloadModal(true)}
          title="Download RDP file for a custom device"
        >
          Download RDP file
        </Button>
      </div>
  
      <Collapse in={isSearchVisible}>
      <div className="mt-2 mb-2">
        <input 
          type="text"
          className="form-control"
          placeholder="Search devices..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
    </Collapse>
    
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
    
      {filteredDevices.length > 0 && (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Devices</th>
              {/* <th>Action</th> */}
            </tr>
          </thead>
          <tbody>
            {filteredDevices.map((device, index) => (
              <tr key={index}>
                <td>
                  <DeviceItem
                    device={device}
                    handleDelete={() => deleteDevice(device)}
                    handleConfirmation={() => confirmRequest(device)}
                    handleEdit={() => editUser(device)}
                    status={deviceStatus[device]}
                    statusUncompleted={deviceUncompleteStatus[device]}
                    date={deviceDates[device]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    
      <Modal show={showDownloadModal} onHide={() => setShowDownloadModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Download RDP file for following device</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <label>Device Name</label>
          <input
            type="text"
            className="form-control"
            value={downloadDeviceName}
            onChange={handleDownloadDeviceChange}
            placeholder="Enter device name"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDownloadModal(false)}>
            Close
          </Button>
          <DownloadRdp computerName={downloadDeviceName} className="btn btn-secondary" />
        </Modal.Footer>
      </Modal>
    </div>
  );
  
  
};

UserDevices.defaultProps = {
  onEditDevice: () => { console.warn("onEditDevice not provided!"); }
};
export default UserDevices;
