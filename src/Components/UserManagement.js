import React from 'react';
import PropTypes from "prop-types";
import UserSearch from './UserSearch';
import CreateUser from './CreateUser';
import UserDevices from './UserDevices';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';
import '../App.css';

const UserManagement = ({ token, userName }) => {
  const popover = (
    <Popover id="popover-basic" style={{maxWidth: '600px'}}>
      <Popover.Header as="h3">Help</Popover.Header>
      <Popover.Body>
        This utility changes the memberships of allowed users and connection options to specific pc from internet.
        <br/><br/>
        If you need to configure your access from the CERN Network please read on this help page: 
        <a href="https://cern.service-now.com/service-portal?id=kb_article&n=KB0004334" style={{color: 'blue'}}> Configuring remote connection via Remote Desktop Gateway</a>
        <br/><br/>
        You must install SafeSign from CMF on your remote machine in order to use smart login.
        <br/><br/>
        To be able to modify the membership of the allowed users and connection options, the account CERN\{userName} must be a CERN primary account and it has to fulfill at least one of the following requirements:
        <br/><br/>
        Is registered as 'Responsible' or 'Main User' of the target computer. To check or modify this information, visit the network database available at 
        <a href="https://landb.cern.ch/portal" style={{color: 'blue'}}> https://landb.cern.ch/portal</a>.
        <br/><br/>
      </Popover.Body>
    </Popover>
  );
  
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
          <UserDevices token={token} userName={userName} />  
        </div>
        <div className="col-md-6">
          <UserSearch token={token} userName={userName} /> 
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
