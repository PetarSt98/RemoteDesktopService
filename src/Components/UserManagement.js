import React from 'react';
import PropTypes from "prop-types";
import UserSearch from './UserSearch';
import CreateUser from './CreateUser';
import '../App.css';

const UserManagement = ({ token }) => {
  return (
    <div className="container py-5 mt-5" style={{ background: '#f5f8fa' }}>
      <h1 className="text-center mb-5 text-primary">User Device Management</h1>
      <div className="row">
        <div className="col-md-6">
          <UserSearch token={token} />  {/* Pass the token as a prop */}
        </div>
        <div className="col-md-6">
          <CreateUser token={token} />  {/* Pass the token as a prop */}
        </div>
      </div>
    </div>
  );
}

UserManagement.propTypes = {
  token: PropTypes.string,
};

export default UserManagement;
