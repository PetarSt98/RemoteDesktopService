import React from 'react';
import PropTypes from "prop-types";
import UserSearch from './UserSearch';
import CreateUser from './CreateUser';
import UserDevices from './UserDevices'; // Import the new component
import '../App.css';

const UserManagement = ({ token, userName }) => {
  return (
    <div className="container py-5 mt-5" style={{ background: '#f5f8fa' }}>
      <h1 className="text-center mb-5 text-primary">Remote Desktop Service</h1>
      <div className="row">
        <div className="col-md-6">
          <UserSearch token={token} />  
        </div>
        <div className="col-md-6">
          <UserDevices token={token} userName={userName} /> 
        </div>
      </div>
    </div>
  );
}

UserManagement.propTypes = {
  token: PropTypes.string,
  userName: PropTypes.string, // Add userName propType
};

export default UserManagement;
