import React, { useState, useEffect } from 'react';
import CreateUser from './CreateUser';
import { useTokenExchangeHandler } from "../shared/useTokenExchangeHandler";
import Swal from 'sweetalert2';
import { DownloadRdp } from './DownloadRdp/DownloadRdp';
import { Button, Modal, Collapse, Toast } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faCog , faCheck, faTimes, faEdit, faQuestion, faSync  } from '@fortawesome/free-solid-svg-icons';
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
  dateAdd: string;
  dateUpdate: string;
  handleDelete: () => void;
  handleConfirmation: () => void;
  handleEdit: () => void;
  handleResetSync: () => void;
}

const DeviceItem: React.FC<DeviceItemProps> = ({ device, status, statusUncompleted, dateAdd, dateUpdate, handleDelete, handleConfirmation, handleEdit, handleResetSync }) => {
  const [showAlert, setShowAlert] = useState<boolean>(statusUncompleted);
  const confirmDelete = () => {
    Swal.fire({
      title: 'Disable Remote Desktop access from outside CERN',
      text: `Click Yes, to disable Remote Desktop access to ${device} from outside CERN for yourself.`,
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

  const callResetSync = () =>
  {
    handleResetSync();
  };

  return (
    <li className="d-flex justify-content-between align-items-center">
            { statusUncompleted && (
        <Toast
          onClose={() => setShowAlert(false)}
          show={showAlert}
          style={{
            position: 'absolute',
            left: 0,
            transform: 'translateX(-102%)',
            zIndex: 1050,
          }}
        >
          <Toast.Header closeButton={true} style={{ fontSize: '12px', padding: '3px',position: 'relative', right: '10px'}}>
            <strong className="mr-auto">Please check the Troubleshooting section in the <a href="https://cern.service-now.com/service-portal?id=kb_article&n=KB0009026" style={{color: 'blue', marginLeft: '4px'}}>manual</a> to learn how to finish the configuration for this device.</strong>
            
          </Toast.Header>
        </Toast>
      )}
      <span className="d-flex align-items-center">
        {statusUncompleted ? (
            <span className='btn btn-sm btn-warning' title='The device configuration is pending' style={{ cursor: 'default', marginRight: '10px' }}>
              <FontAwesomeIcon icon={faQuestion} />
            </span>
        ) : (
          <span 
            className={`btn btn-sm ${status ? 'btn-success' : 'btn-danger'}`} 
            title={status ? 'The device is configured for remote access' : 'This device is not yet configured for remote access'}
            style={{ cursor: 'default', marginRight: '10px' }}
          >
            {status ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faTimes} />}
          </span>
        )}
        <span title={`Added on: ${dateAdd}\nLast update: ${dateUpdate}`}>
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
        <Button variant="outline-primary" size="sm" className="ml-3 button-hover-effect" onClick={callResetSync} title="Restart the synchronization for this device" style={{ marginLeft: '4px', borderColor: 'orange', color: 'orange' }}>
          <FontAwesomeIcon icon={faSync} className="fa-icon" /> 
        </Button>
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
  const [deviceAddDates, setDeviceAddDates] = useState<{ [key: string]: string }>({});
  const [deviceUpdateDates, setDeviceUpdateDates] = useState<{ [key: string]: string }>({});
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [exchangeToken, setExchangeToken] = useState("");
  const [isAddDeviceVisible, setIsAddDeviceVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // New state for add device visibility
  const [searchTerm, setSearchTerm] = useState(""); // New state for the search term
  const [filteredDevices, setFilteredDevices] = useState<string[]>([]); // New state for filtered devices
  const [isSearchVisible, setIsSearchVisible] = useState(false); // New state for search visibility

  useTokenExchangeHandler(token, setExchangeToken);
  // console.log("Token: ", exchangeToken)
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

  // console.log(onEditDevice);

  const editUser = (device: string) => {
    // console.log(onEditDevice);
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
      // console.log('Received statuses:', statuses); // Added console.log here
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
    fetch(`https://rdgateway-backend.app.cern.ch/api/devices_tabel/date_check`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json', 
        Authorization: "Bearer " + exchangeToken
      },
      body: JSON.stringify({ userName, deviceNames }), // Include userName and deviceNames in request body
    })
    .then(response => response.json())
    .then(statuses => {
      // console.log('Received statuses:', statuses); // Added console.log here
      const deviceAddDates: { [key: string]: string } = {};
      const deviceUpdateDates: { [key: string]: string } = {};
      for (let i = 0; i < deviceNames.length; i++) {
        deviceAddDates[deviceNames[i]] = statuses[i].createDate;
        deviceUpdateDates[deviceNames[i]] = statuses[i].updateDate;
      }
      setDeviceAddDates(deviceAddDates);
      setDeviceUpdateDates(deviceUpdateDates);
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

  const resetSync = (device: string) => {
    Swal.fire({
      title: 'Restart Synchronization',
      text: 'Do you want to restart the synchronization for this device?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`https://rdgateway-backend.app.cern.ch/api/devices_tabel/restart?userName=${userName}&deviceName=${device}`, {
          method: "GET",
          headers: {
            Authorization: "Bearer " + exchangeToken
          }
        })
        .then(response => response.text())
        .then(data => {
          if (data === "Successful sync restart!") {
            Swal.fire({
              text: "Synchronization restart initiated. Synchronization will take around 25 minutes.",
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
            text: "Failed to restart the synchronization.",
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
              <FontAwesomeIcon icon={faCog} /> Configure device
            </Button>
          ) : (
            <Button
              variant="outline-secondary"
              onClick={handleToggleAddDevice}
              title="Hide tab for adding a new device to the user"
            >
              <FiX /> Hide configure device
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
          <CreateUser token={token} userName={userName} editUser={editUser} />
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
                    handleResetSync={() => resetSync(device)}
                    status={deviceStatus[device]}
                    statusUncompleted={deviceUncompleteStatus[device]}
                    dateAdd={deviceAddDates[device]}
                    dateUpdate={deviceUpdateDates[device]}
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
