import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { 
  keycloakAuthenticated,
  keycloakUserToken,
  keycloakInstance,
} from "./selectors";

import AuthRibbon from './Components/AuthRibbon';
import UserManagement from './Components/UserManagement';
import Footer from './Components/Footer';
import HomePage from './HomePage';
import LogMeOff from './Components/LogMeOff';
import LogUserOff from './Components/LogUserOff';
import Debugger from './Components/Debugger';

const App = ({ authenticated, userToken, kcInstance }) => {
  const [accountType, setAccountType] = useState(null);

  return (
    <Router>
      <AuthRibbon 
        authenticated={authenticated} 
        userToken={userToken} 
        kcInstance={kcInstance} 
        onAccountTypeChange={setAccountType}
      />
      <Routes>
        <Route path="/" element={
          <HomePage 
            token={kcInstance.token} 
            userName={userToken.preferred_username} 
            primaryAccount={accountType}
          />
        } />
        <Route path="/gateway" element={
          <UserManagement 
            token={kcInstance.token} 
            userName={userToken.preferred_username} 
            primaryAccount={accountType}
          />
        } />
        <Route path="/log-me-off" element={
          <LogMeOff 
          token={kcInstance.token} 
          userName={userToken.preferred_username} 
          primaryAccount={accountType}
          />
        } />
        <Route path="/log-user-off" element={
          <LogUserOff 
          token={kcInstance.token} 
          userName={userToken.preferred_username} 
          primaryAccount={accountType}
          />
        } />
        <Route path="/debugger" element={
          <Debugger 
          token={kcInstance.token} 
          userName={userToken.preferred_username} 
          primaryAccount={accountType}
          />
        } />
      </Routes>
      <Footer />
    </Router>
  );
};

App.propTypes = {
  authenticated: PropTypes.bool,
  userToken: PropTypes.object,
  kcInstance: PropTypes.object
};

export default connect((state) => ({
  kcInstance: keycloakInstance(state),
  authenticated: keycloakAuthenticated(state),
  userToken: keycloakUserToken(state),
}))(App);
