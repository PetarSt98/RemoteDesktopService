import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { connect } from "react-redux";
import PropTypes from "prop-types";
import {
  keycloakAuthenticated,
  keycloakUserToken,
  keycloakInstance,
} from "./selectors";
import AuthRibbon from './Components/AuthRibbon';
import UserManagement from './Components/UserManagement';

const App = ({ authenticated, userToken, kcInstance }) => {
  return (
    <div className="App">
      <AuthRibbon authenticated={authenticated} userToken={userToken} kcInstance={kcInstance} />
      <UserManagement token={kcInstance.token} />
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
