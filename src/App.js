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
import Footer from './Components/Footer'; // import the Footer component
import './design/bg.jpg'; // import the image

const App = ({ authenticated, userToken, kcInstance }) => {
  return (
    <div className="App">
      <AuthRibbon authenticated={authenticated} userToken={userToken} kcInstance={kcInstance} />
      <div className="headerImage"> {/* A div for the background image */}
        <h1 className="headerTitle">CERN Remote Desktop Service</h1> {/* The title text */}
      </div>
      {userToken.preferred_username && (
        <UserManagement token={kcInstance.token} userName={userToken.preferred_username} />
      )}
      <Footer /> {/* Place the Footer component here */}
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
