import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import UserSearch from './Components/UserSearch';
import DeviceList from './Components/DeviceList';
import CreateUser from './Components/CreateUser';
import { connect } from "react-redux";
import {
  keycloakAuthenticated,
  keycloakUserToken,
  keycloakInstance,
} from "./selectors";
import PropTypes from "prop-types";

import './App.css';

const App = ({ authenticated, userToken, kcInstance }) => {
  const logout = () => {
    kcInstance.logout();
  };

  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    const getData = async () => {
      const userInfoResponse = await fetch(
        `${userToken.iss}/protocol/openid-connect/userinfo`,
        {
          headers: { Authorization: `Bearer ${kcInstance.token}` },
        }
      );
      setUserInfo(await userInfoResponse.json());
    };
    getData();
  }, [userToken, kcInstance.token]);

  return (
    <div className="App">
      <div className="top-ribbon">
        <div className="user-info">
          <p className="user-name">{userInfo.name}</p>
          <p className="user-username">{userInfo.preferred_username}</p>
        </div>
        {authenticated && (
          <button className="logout-button" onClick={() => logout()}>Logout</button>
        )}
      </div>
      <div className="container py-5 mt-5" style={{ background: '#f5f8fa' }}>
        <h1 className="text-center mb-5 text-primary">User Device Management</h1>
        <div className="row">
          <div className="col-md-6">
            <UserSearch token={userToken} />  {/* Pass the token as a prop */}
          </div>
          <div className="col-md-6">
            <CreateUser token={userToken} />  {/* Pass the token as a prop */}
          </div>
        </div>
      </div>
    </div>
  );
}

App.propTypes = {
  authenticated: PropTypes.bool,
  userToken: PropTypes.object,
};

export default connect((state) => ({
  kcInstance: keycloakInstance(state),
  authenticated: keycloakAuthenticated(state),
  userToken: keycloakUserToken(state),
}))(App);
