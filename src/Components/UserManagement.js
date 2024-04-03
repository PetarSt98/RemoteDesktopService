import React, { useRef, useState, useEffect } from 'react';
import PropTypes from "prop-types";
import UserSearch, { UserSearchRef } from './UserSearch';
import CreateUser from './CreateUser';
import UserDevices from './UserDevices';
import { useTokenExchangeHandler } from "../shared/useTokenExchangeHandler";
import { Button, OverlayTrigger, Popover, Modal, Tooltip, Toast } from 'react-bootstrap';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';


const hideSearchBar = true;

const UserManagement = ({ token, userName, primaryAccount }) => {
  const [selectedDevice, setSelectedDevice] = useState("");
  const [hideSearch, setHideSearch] = useState(hideSearchBar); 
  const [exchangeToken, setExchangeToken] = useState("");

  const [showToast, setShowToast] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useTokenExchangeHandler(token, setExchangeToken);

  useEffect(() => {
    if (exchangeToken.length > 0) {
      setIsLoading(true);
      fetch(`https://rdgateway-backend.app.cern.ch/api/devices_tabel/admins?userName=${userName}`, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + exchangeToken
        }
      })
      .then(response => response.json())
      .then(data => {
        // Assuming your controller returns a boolean
        setHideSearch(data);  // Update the hideSearch state with the returned value
        setIsLoading(false);
      })
      .catch(error => console.error('Error fetching the hideSearch data:', error));
    }
    else {
      setIsLoading(true);
    }
  }, [exchangeToken, userName]); 

  useEffect(() => {
    if (exchangeToken.length > 0) {
      fetch('https://rdgateway-backend.app.cern.ch/api/debugger/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: "Bearer " + exchangeToken },
        body: JSON.stringify({ Username: userName }),
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Network response was not ok.');
      })
      .then(data => {
        console.log(data);
      })
      .catch(error => {
        console.error('Error fetching initial lock statuses:', error)
      });
    }
  }, [exchangeToken, userName]);

  useEffect(() => {
    // Automatically hide the toast after 5 seconds (5000 milliseconds)
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 20000);

    return () => clearTimeout(timer);
  }, []);

  const popover = (
    <Popover id="popover-basic" style={{maxWidth: '600px'}}>
      <Popover.Header as="h3">Help</Popover.Header>
      <Popover.Body>
        This webpage manages the list of users allowed to connect to devices from outside CERN.
        <br/><br/>
        To find the instructions for how to use the website, please use the 
        <a href="https://cern.service-now.com/service-portal?id=kb_article&n=KB0009026" style={{color: 'blue', marginLeft: '4px'}}>manual.</a>
        <br/><br/> 
        To be able to modify the list of users allowed to connect to a device, the account CERN\{userName} must be a CERN primary account and it has to fulfill at least one of the following requirements:
        <br/><br/>
        Is registered as 'Responsible' or 'Main User' of the device. To check or modify this information, visit the network database available at 
        <a href="https://landb.cern.ch/portal" style={{color: 'blue', marginLeft: '4px'}}>https://landb.cern.ch/portal</a>.
        <br/><br/>
        If you would like to learn more or troubleshoot access issues please read: 
        <a href="https://cern.service-now.com/service-portal?id=kb_article&n=KB0004334" style={{color: 'blue', marginLeft: '4px'}}>Configuring remote connection via Remote Desktop Gateway</a>
      </Popover.Body>
    </Popover>
  );
  const userSearchRef = useRef(null);

  const handleDeviceEdit = (deviceName) => {
    setSelectedDevice(deviceName);
  }
  const navigate = useNavigate(); // Initialize useNavigate hook

  // Function to navigate to home
  const navigateHome = () => {
    navigate('/'); // Navigate to the home route using navigate function
  };

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Go to home page
    </Tooltip>
  );

  if (isLoading) {
    return (
      <div className="App">
        <div className="headerImage py-5">
          <h1 className="headerTitle text-center">CERN Remote Desktop Service</h1>
        </div>
        <div className="container my-5">
          <p className="lead text-center mb-5">Checking your access privileges...</p>
          {/* Optionally, you can add a spinner or loading animation here */}
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Toast
        onClose={() => setShowToast(false)}
        show={showToast}
        delay={5000}
        autohide
        style={{
          position: 'fixed',
          top: 60,
          right: 20,
          zIndex: 1050,
        }}
      >
        <Toast.Header>
          <strong className="me-auto">Welcome to CERN Remote Desktop Gateway</strong>
        </Toast.Header>
        <Toast.Body>If you're using this website for the first time, please read the instructions by clicking the help button.</Toast.Body>
      </Toast>
      <div className="headerImage">
        <h1 className="headerTitle">CERN Remote Desktop Service</h1>
      </div>
      <div className="container py-3 mt-3" style={{ background: '#f5f8fa' }}>
        <div className="d-flex justify-content-center align-items-center mb-3">
        <OverlayTrigger
      placement="right"
      delay={{ show: 250, hide: 400 }}
      overlay={renderTooltip}
    >
      <button
        onClick={navigateHome}
        style={{
          position: 'absolute',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          padding: '10px 15px',
          cursor: 'pointer',
          fontSize: '16px',
          marginRight: '1195px'
        }}
      >
        <FontAwesomeIcon icon={faHome} style={{ marginRight: '8px' }} />
        Home
      </button>
    </OverlayTrigger>
          <h1 className="title" style={{ position: 'absolute', marginTop: '0', marginBottom: '0' }}>Manage Remote Desktop access to your devices from outside CERN</h1>
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <OverlayTrigger trigger="click" placement="left" overlay={popover} rootClose>
              <Button variant="secondary">Help</Button>
            </OverlayTrigger>
          </div>
        </div>
      <div className="row">
        <div className="col-md-6">
          <UserDevices token={token} userName={userName} onEditDevice={handleDeviceEdit} />
        </div>
        <div className="col-md-6">
        <UserSearch token={token} userName={userName} primaryAccount={primaryAccount} deviceNameForEdit={selectedDevice} onEditComplete={() => {setSelectedDevice(""); setHideSearch(hideSearch);}} hideSearch={hideSearch}  />
        </div>
      </div>
    </div>
    </div>
  );
}

UserManagement.propTypes = {
  token: PropTypes.string,
  userName: PropTypes.string,
};

export default UserManagement;
