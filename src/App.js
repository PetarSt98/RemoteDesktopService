// App.tsx
import React, { useEffect, useState } from 'react';
// import Keycloak from 'keycloak-js';
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
// const initOptions = {
//   url: 'https://auth.cern.ch/auth',
//   realm: 'cern',
//   clientId: 'sso-example',
//   redirectUri: 'https://rds-front-rds-frontend.app.cern.ch/',
// };

// let keycloak = Keycloak(initOptions);

// interface UserSearchProps {
//   token: string;
// }

// interface CreateUserProps {
//   token: string;
// }

// const App: React.FC = () => {
//   const [auth, setAuth] = useState(false);
//   const [username, setUsername] = useState('');
//   const [token, setToken] = useState('');

  // const login = () => {
  //   keycloak.init({ onLoad: 'login-required' }).then((authenticated) => {
  //     if (authenticated) {
  //       console.log(keycloak.token);  // Log the token to the console
  //       setAuth(true);
  //       setUsername(keycloak.tokenParsed?.preferred_username || '');
  //       setToken(keycloak.token || '');  // Set the token
  //     } else {
  //       setAuth(false);
  //     }
  //   });
  // }

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
      <>
        {authenticated === false && <p>Loading...</p>}
        {authenticated && (
          <>
            <p>Authentication status: {authenticated ? "true" : "false"}</p>
            {authenticated && (
              <p>
                <button onClick={() => logout()}>Logout</button>
              </p>
            )}
            <hr />
            <p>My user token: </p>
            <div>
              <code style={{ whiteSpace: "pre-wrap" }}>
                {JSON.stringify(userToken, null, 2)}
              </code>
            </div>
            <hr />
            <p>My user info: </p>
            <div>
              <code style={{ whiteSpace: "pre-wrap" }}>
                {JSON.stringify(userInfo, null, 2)}
              </code>
            </div>
          </>
        )}
  
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
      </>
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
// export default App;
