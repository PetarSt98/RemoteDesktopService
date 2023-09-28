import React, { useRef, useState } from 'react';
import PropTypes from "prop-types";
import UserSearch, { UserSearchRef } from './UserSearch';
import CreateUser from './CreateUser';
import UserDevices from './UserDevices';
import { Button, OverlayTrigger, Popover, Modal } from 'react-bootstrap';
import '../App.css';

const hideSearchBar = true;

const UserManagement = ({ token, userName, primaryAccount }) => {
  const [selectedDevice, setSelectedDevice] = useState("");
  const [hideSearch, setHideSearch] = useState(hideSearchBar); 

  const popover = (
    <Popover id="popover-basic" style={{maxWidth: '600px'}}>
      <Popover.Header as="h3">Help</Popover.Header>
      <Popover.Body>
        This website manages the list of users allowed to connect to devices from outside CERN.
        <br/><br/>
         To be able to modify the list of users allowed to connect to a device, the account CERN\{userName} must be a CERN primary account and it has to fulfill at least one of the following requirements:
        <br/><br/>
        Is registered as 'Responsible' or 'Main User' of the device. To check or modify this information, visit the network database available at 
        <a href="https://landb.cern.ch/portal" style={{color: 'blue'}}> https://landb.cern.ch/portal</a>.
        <br/><br/>
        If you would like to learn more or troubleshoot access issues please read: 
        <a href="https://cern.service-now.com/service-portal?id=kb_article&n=KB0004334" style={{color: 'blue'}}> Configuring remote connection via Remote Desktop Gateway</a>
        <br/><br/>
      </Popover.Body>
    </Popover>
  );
  const userSearchRef = useRef(null);

  const handleDeviceEdit = (deviceName) => {
    setSelectedDevice(deviceName);
  }
  
  return (
    <div className="container py-5 mt-5" style={{ background: '#f5f8fa' }}>
      <div className="d-flex justify-content-center align-items-center mb-5">
        <h1 className="title" style={{position: 'absolute'}}>Manage the Remote Desktop Connection Access For a Client PC</h1>
        <div style={{display: 'flex', justifyContent: 'flex-end', width: '100%'}}>
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
        <UserSearch token={token} userName={userName} primaryAccount={primaryAccount} deviceNameForEdit={selectedDevice} onEditComplete={() => {setSelectedDevice(""); setHideSearch(hideSearch);}} hideSearch={hideSearch} />



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
