// App.tsx
import React, { useState } from 'react';
import Keycloak from 'keycloak-js';
import 'bootstrap/dist/css/bootstrap.min.css';
import UserSearch from './Components/UserSearch';
import DeviceList from './Components/DeviceList';
import CreateUser from './Components/CreateUser';

const initOptions = {
  url: 'https://auth.cern.ch/auth',
  realm: 'cern',
  clientId: 'sso-example',
  redirectUri: 'https://rds-front-rds-frontend.app.cern.ch/',
};

let keycloak = Keycloak(initOptions);

interface UserSearchProps {
  token: string;
}

interface CreateUserProps {
  token: string;
}

const App: React.FC = () => {
  const [auth, setAuth] = useState(false);
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');

  const login = () => {
    keycloak.init({ onLoad: 'login-required' }).then((authenticated) => {
      if (authenticated) {
        setAuth(true);
        setUsername(keycloak.tokenParsed?.preferred_username || '');
        setToken(keycloak.token || '');  // Set the token
      } else {
        setAuth(false);
      }
    });
  }

  return (
    <>
      <div className="py-3 mb-2 fixed-top w-100" style={{ background: 'black', color: 'white' }}>
        <div className="container">
          <div style={{ float: 'right' }}>
            {!auth && (
              <button onClick={login} className="btn btn-primary mr-2" style={{ background: 'black', color: 'white', border: 'none', height: '100%' }}>Login</button>
            )}
            {auth && (
              <>
                <span className="mr-2">Hello, {username}</span>
                <button onClick={() => keycloak.logout()} className="btn btn-secondary" style={{ background: 'black', color: 'white', border: 'none', height: '100%' }}>Logout</button>
              </>
            )}
          </div>
        </div>
      </div>
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
    </>
  );
}

export default App;
